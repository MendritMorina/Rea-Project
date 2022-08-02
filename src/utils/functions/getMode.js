// Function that is used to get the current value of process.env.NODE_ENV;
const getMode = () => {
  const currentMode = process.env.NODE_ENV;
  const allowedModes = ['development', 'staging', 'production'];
  if (!allowedModes.includes(currentMode)) return 'development';

  return currentMode;
};

// Exports of this file.
module.exports = getMode;
