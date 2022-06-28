// Imports: third-party packages.
const schedule = require('node-schedule');
const axios = require('axios');

// Imports: local files.
const AQI = require('../../models/AQI');

const removeDataDB = async () => {
  await AQI.deleteMany({});
};
removeDataDB();

const getAPI = async () => {
  await axios.get('https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=0');
};

// Function that is used to init all jobs.
const initJobs = () => {
  // schedule.scheduleJob('0 */1 * * *', async () => {
  //   await getAPI();
  // });
  schedule.scheduleJob('* * * * *', async () => {
    // await getAPI();
  });
};
// Exports of this file.
module.exports = initJobs;
