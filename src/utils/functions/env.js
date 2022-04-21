// Imports: local files.
const getMode = require('./getMode');
const { env } = require('../../configs');

// Get current .env values.
const currentMode = getMode();
const currentEnv = env[currentMode];

// Functions that are used to access .env values used in our API.
const getAll = () => {
  return currentEnv;
};
const getByKey = (key) => {
  return currentEnv[key];
};
const getByKeys = (keys) => {
  if (Array.isArray(keys) && keys.length) {
    const newEnv = keys.reduce((previous, current) => {
      if (keys.includes(current)) previous[current] = currentEnv[current];
      return previous;
    }, {});

    return newEnv;
  }

  return {};
};
const count = () => {
  return currentEnv ? Object.keys(currentEnv).length : 0;
};
const validateEnv = () => {
  const { requiredKeys } = env;
  if (!requiredKeys || !requiredKeys.length) return false;

  return requiredKeys.every((key) => Boolean(process.env[key]));
};

// Exports of this file.
module.exports = { getAll, getByKey, getByKeys, count, validateEnv };
