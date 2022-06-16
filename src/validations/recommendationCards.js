// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/recommendationCard.
const validator = {
  getAllRecommendationCards: {
    params: Joi.object({
      recommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
      baseRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
      informativeRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
    }),
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
      select: Joi.string().optional(),
      sort: Joi.string().optional().default('name'),
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
      recommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      type: Joi.string().required(),
    }),
  },
  updateRecommendationCard: {
    params: Joi.object({
      recommendationCardId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      recommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
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
