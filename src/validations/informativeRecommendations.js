// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendation.
const validator = {
  getAllInformativeRecommendations: {
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
  createInformativeRecommendation: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      airQuality: Joi.string().required(),
      isPregnant: Joi.boolean().optional().default(false),
      hasChildren: Joi.boolean().optional().default(false),
      isGeneric: Joi.boolean().optional().default(false),
      age: Joi.string().optional().default(''),
      gender: Joi.string().optional().default(''),
      haveDiseaseDiagnosis: Joi.string().optional().default(''),
      energySource: Joi.string().optional().default(''),
      hasChildrenDisease: Joi.string().optional().default(''),
      isGeneric: Joi.boolean().optional().default(false),
    }),
  },
  updateInformativeRecommendation: {
    params: Joi.object({
      informativeRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      airQuality: Joi.string().required(),
      isPregnant: Joi.boolean().optional().default(false),
      hasChildren: Joi.boolean().optional().default(false),
      isGeneric: Joi.boolean().optional().default(false),
      age: Joi.string().optional().default(''),
      gender: Joi.string().optional().default(''),
      haveDiseaseDiagnosis: Joi.string().optional().default(''),
      energySource: Joi.string().optional().default(''),
      hasChildrenDisease: Joi.string().optional().default(''),
      isGeneric: Joi.boolean().optional().default(false),
    }),
  },
  validateInformativeRecommendationId: {
    params: Joi.object({
      informativeRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
