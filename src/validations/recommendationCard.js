// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendationCard.
const validator = {
  getAllRecommendationCards: {
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
      recommendationCard: Joi.array()
        .optional()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
        )
        .default(null),
    }),
  },
  createRecommendationCard: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      recommendation: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  updateRecommendationCard: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      recommendation: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  validateRecommendationCardId: {
    params: Joi.object({
      id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
