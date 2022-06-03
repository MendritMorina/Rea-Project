// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that is used to validate requests related to the Auth controller.
const validator = {
  signup: {
    body: Joi.object({
      providerId: Joi.string().required(),
      uid: Joi.string().required(),
      name: Joi.string().required(),
      surname: Joi.string().required(),
    }),
  },
  login: {
    body: Joi.object({
      providerId: Joi.string().required(),
      token: Joi.string().required(),
    }),
  },
  forgot: {
    body: Joi.object({
      email: Joi.string().email().optional(),
    }),
  },
  reset: {
    body: Joi.object({
      email: Joi.string().email().optional(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
