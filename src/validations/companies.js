// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/companies.
const validator = {
  getAllCompanies: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
    }),
  },
  createCompany: {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      number: Joi.number().required(),
      logo: Joi.any().optional(),
    }),
  },
  updateCompany: {
    params: Joi.object({
      companyId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      number: Joi.number().required(),
      logo: Joi.any().optional(),
    }),
  },
  validateCompanyId: {
    params: Joi.object({
      companyId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
