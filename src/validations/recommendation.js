// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendation.
const validator = {
  getAllRecommendations: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
      type: Joi.array()
        .optional()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
        )
        .default(null),
      recommendation: Joi.array()
        .optional()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
        )
        .default(null),
    }),
  },
  createRecommendation: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      weather: Joi.string().optional().default(null),
      aqi: Joi.number().optional().default(0),
      haveDiseaseDiagnosis: Joi.array().optional().items(Joi.string().required()).default(null),
      energySource: Joi.array().optional().items(Joi.string().optional()).default(null),
      hasChildren: Joi.boolean().optional().default(false),
      hasChildrenDisease: Joi.array().optional().items(Joi.string().required()).default(null),
      recommendationCards: Joi.array().optional().items(Joi.string().required()).default(null),
      category: Joi.string().required(),
    }),
  },
  updateRecommendation: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      body: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        weather: Joi.string().optional().default(null),
        aqi: Joi.number().optional().default(0),
        haveDiseaseDiagnosis: Joi.array().optional().items(Joi.string().required()).default(null),
        energySource: Joi.array().optional().items(Joi.string().required()).default(null),
        hasChildren: Joi.boolean().optional().default(false),
        hasChildrenDisease: Joi.array().optional().items(Joi.string().required()).default(null),
        recommendationCards: Joi.array().optional().items(Joi.string().required()).default(null),
        category: Joi.string().required(),
      }),
    }),
  },
  validateRecommendationId: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
