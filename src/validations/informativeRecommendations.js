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
      baseRecommendationsId: Joi.array()
        .optional()
        .items(
          Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
        )
        .default(null),
    }),
  },
  updateInformativeRecommendation: {
    params: Joi.object({
      informativeRecommendationId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      pullFromId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
      pushToId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
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
