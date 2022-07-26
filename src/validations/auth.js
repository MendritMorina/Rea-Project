// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that is used to validate requests related to the Auth controller.
const validator = {
  authenticate: {
    body: Joi.object({
      name: Joi.string().required(),
      surname: Joi.string().required(),
      fcmToken: Joi.string().optional(),
    }),
  },
  update: {
    body: Joi.object({
      name: Joi.string().optional(),
      surname: Joi.string().optional(),
      email: Joi.string().email().optional(),
      age: Joi.string().optional(),
      gender: Joi.string().optional(),
      aqi: Joi.number().optional().default(0),
      isPregnant: Joi.boolean().optional(),
      haveDiseaseDiagnosis: Joi.array().optional().items(Joi.string().optional()),
      energySource: Joi.array().optional().items(Joi.string().optional()),
      hasChildren: Joi.boolean().optional().default(false),
      hasChildrenDisease: Joi.array().optional().items(Joi.string().optional()),
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
