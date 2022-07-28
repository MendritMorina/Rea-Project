// Imports: third-party packages.
const { Joi } = require('express-validation');

// Imports: local files.
const { notificationTypes } = require('../configs');

// Validator object that holds validation related to the controller in ./src/controllers/notificationTypes.
const validator = {
  getAll: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
    }),
  },
  getOne: {
    params: Joi.object({
      notificationTypeId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  subscribe: {
    body: Joi.object({
      type: Joi.string()
        .required()
        .allow(...notificationTypes),
    }),
  },
  unsubscribe: {
    body: Joi.object({
      type: Joi.string()
        .required()
        .allow(...notificationTypes),
    }),
  },
};

// Exports of this file.
module.exports = validator;
