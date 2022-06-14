const { httpCodes, staticValues } = require('../../configs');

const checkValidValues = (type, values) => {
  for (const value of values) {
    if (!staticValues[type].includes(value)) {
      return {
        error: `The value of ${value} is not in allowed values : ${staticValues[type]} !`,
        code: httpCodes.BAD_REQUEST,
      };
    }
  }
  return null;
};

module.exports = checkValidValues;
