// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendationCard.
const validator = {
  getAllRecommendationCards: {
    params: Joi.object({
      recommendation: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      // recommendation: Joi.string()
      //   .regex(/^[0-9a-fA-F]{24}$/)
      //   .required(),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
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
  createRecommendationCard: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      recommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  updateRecommendationCard: {
    params: Joi.object({
      recommendationCardId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      recommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      toBeDeleted: Joi.array().optional().items(Joi.string().optional()),
    }),
  },
  validateRecommendationCardId: {
    params: Joi.object({
      recommendationCardId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
