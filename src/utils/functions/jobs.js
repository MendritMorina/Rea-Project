// Imports: third-party packages.
const schedule = require('node-schedule');
const axios = require('axios');

// Imports: local files.
const AQI = require('../../models/AQI');
const Cronjob = require('../../models/Cronjob');

const getAPI = async () => {
  try {
    const aqi = await axios.get('https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=0');
    const aqiData = aqi.data;

    for (let i = 0; i < aqiData.length; i++) {
      const { localtime, x, y, pm10, pm25, no2, so2, o3, index, name } = aqiData[i];
      const geoJSON = {
        localtime: localtime,
        geometry: {
          type: 'Point',
          coordinates: [x, y],
        },
        pm10: pm10,
        pm25: pm25,
        no2: no2,
        so2: so2,
        o3: o3,
        index: index,
        name: name,
      };

      await AQI.create(geoJSON);
    }

    const before12hours = new Date(Date.now() - 1000 * 60 * 60 * 12);
    await AQI.deleteMany({ createdAt: { $lte: before12hours } });

    await Cronjob.create({
      type: 'GET_AQI',
      success: true,
      information: {},
    });
  } catch (error) {
    await Cronjob.create({
      type: 'GET_AQI',
      success: false,
      information: { error: error.message || 'Server Error' },
    });
  }
};
getAPI();

// Function that is used to init all jobs.
const initJobs = () => {
  // schedule.scheduleJob('0 */1 * * *', async () => {
  //   await getAPI();
  // });
  schedule.scheduleJob('* * * * *', async () => {
    //   await getAPI();
  });
};

// Exports of this file.
module.exports = initJobs;
