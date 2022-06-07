// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that is used to validate requests related to the Auth controller.
const validator = {
  authenticate: {
    body: Joi.object({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      token: Joi.string().required(),
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
  adminLogin: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
