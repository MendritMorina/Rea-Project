// Imports: third-party packages.
const { Joi } = require('express-validation');

// Imports: local files.
const { notificationTypes } = require('../configs');

// Validator object that holds validation related to the controller in ./src/controllers/notifications.
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
      notificationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  create: {
    body: Joi.object({
      title: Joi.string().required(),
      body: Joi.string().required(),
      type: Joi.string()
        .required()
        .allow(...notificationTypes),
    }),
  },
};

// Exports of this file.
module.exports = validator;
