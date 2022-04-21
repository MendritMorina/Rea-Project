// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that is used to validate requests related to the Auth controller.
const validator = {
  signup: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  forgot: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  reset: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
