// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendation.
const validator = {
  getAllBaseRecommendations: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
      select: Joi.string().optional(),
      sort: Joi.string().optional().default('name'),
    }),
  },
  createBaseRecommendation: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      // age: Joi.array().optional().items(Joi.string().optional()).default(null),
      airQuality: Joi.string().required(),
      // gender: Joi.array().required().items(Joi.string().required()).default(null),
      // haveDiseaseDiagnosis: Joi.array().optional().items(Joi.string().optional()).default(null),
      // energySource: Joi.array().optional().items(Joi.string().optional()).default(null),
      isPregnant: Joi.boolean().optional().default(false),
      hasChildren: Joi.boolean().optional().default(false),
      // hasChildrenDisease: Joi.array().optional().items(Joi.string().required()).default(null),
      age: Joi.string().optional().default(''),
      gender: Joi.string().optional().default(''),
      haveDiseaseDiagnosis: Joi.string().optional().default(''),
      // energySource: Joi.string().optional().default(''),
      // hasChildrenDisease: Joi.string().optional().default(''),
    }),
  },
  updateBaseRecommendation: {
    params: Joi.object({
      baseRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      // age: Joi.array().optional().items(Joi.string().optional()),
      // gender: Joi.array().optional().items(Joi.string().required()),
      airQuality: Joi.string().optional(),
      // haveDiseaseDiagnosis: Joi.array().optional().items(Joi.string().required()).default(null),
      // energySource: Joi.array().optional().items(Joi.string().required()).default(null),
      isPregnant: Joi.boolean().optional(),
      hasChildren: Joi.boolean().optional().default(false),
      // hasChildrenDisease: Joi.array().optional().items(Joi.string().required()).default(null),
      toBeDeleted: Joi.array().optional().items(Joi.string().optional()),
      age: Joi.string().optional().default(''),
      gender: Joi.string().optional().default(''),
      haveDiseaseDiagnosis: Joi.string().optional().default(''),
      // energySource: Joi.string().optional().default(''),
      // hasChildrenDisease: Joi.string().optional().default(''),
    }),
  },
  validateBaseRecommendationId: {
    params: Joi.object({
      baseRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
