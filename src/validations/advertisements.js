// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/advertisement.
const validator = {
  getAllAdvertisements: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
      select: Joi.string().optional().default('name,description'),
      sort: Joi.string().optional().default('name'),
    }),
  },
  createAdvertisement: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      priority: Joi.number().optional().default(1).greater(0).less(21),
      webLink: Joi.string().optional(),
      iosLink: Joi.string().optional(),
      androidLink: Joi.string().optional(),
    }),
  },
  updateAdvertisement: {
    params: Joi.object({
      advertisementId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        priority: Joi.number().optional().default(1).greater(0).less(21),
        webLink: Joi.string().optional(),
        iosLink: Joi.string().optional(),
        androidLink: Joi.string().optional(),
        toBeDeleted: Joi.array().optional().items(Joi.string().optional()),
      }),
    }),
  },
  clickAdvertisement: {
    body: Joi.object({
      advertisementId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      type: Joi.string().required(),
    }),
  },

  validateAdvertisement: {
    params: Joi.object({
      advertisementId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
