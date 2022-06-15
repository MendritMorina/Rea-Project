// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/stories.
const validator = {
  getAllStories: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
    }),
  },
  getAllAdmin: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
    }),
  },
  createStory: {
    body: Joi.object({
      name: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().required(),
      authorName: Joi.string().required(),
      authorSurname: Joi.string().required(),
      narratorName: Joi.string().required(),
      narratorSurname: Joi.string().required(),
      category: Joi.string(),
    }),
  },
  updateStory: {
    params: Joi.object({
      storyId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().optional(),
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      authorName: Joi.string().optional(),
      authorSurname: Joi.string().optional(),
      narratorName: Joi.string().optional(),
      narratorSurname: Joi.string().optional(),
      category: Joi.string().optional(),
    }),
  },
  validateStoryId: {
    params: Joi.object({
      storyId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
