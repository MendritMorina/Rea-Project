// Imports: third-party packages.
const schedule = require('node-schedule');

const OneHour = schedule.scheduleJob('0 */1 * * *', () => {
  // At minute 0 past every hour.
  console.log('');
});
