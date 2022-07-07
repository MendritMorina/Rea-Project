// Imports: third-party packages.
const schedule = require('node-schedule');
const axios = require('axios');

// Imports: local files.
const AQI = require('../../models/AQI');
const Cronjob = require('../../models/Cronjob');

const getAQI = async () => {
  try {
    const aqi = await axios.get('https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=0');
    const aqiData = aqi.data;

    for (let i = 0; i < aqiData.length; i++) {
      if (!aqiData[i]) continue;

      const { localtime, x, y, pm10, pm25, no2, so2, o3, index, name } = aqiData[i];
      const geometry = { type: 'Point', coordinates: [x, y] };
      const geoJSON = { localtime, location: { geometry }, pm10, pm25, no2, so2, o3, index, name };

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

// Function that is used to init all jobs.
const initJobs = () => {
  // schedule.scheduleJob('0 * * * *', async () => {
  //   await getAQI();
  // });
  schedule.scheduleJob('* * * * *', async () => {
    await getAQI();
  });
};

// Exports of this file.
module.exports = initJobs;
