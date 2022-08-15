// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/aqi.
const validator = {
  getPredictions: {
    query: Joi.object({
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
