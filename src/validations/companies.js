// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/companies.
const validator = {
  getAllCompanies: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      name: Joi.string().optional().default(null),
      active: Joi.number().optional().default(null).allow(null, 0, 1),
      deleted: Joi.number().optional().default(null).allow(null, 0, 1),
    }),
  },
  createCompany: {
    body: Joi.object({
      name: Joi.string().required(),
      //email: Joi.string().required(),
      //number: Joi.number().required(),
      //logo:
    }),
  },
  updateCompany: {
    params: Joi.object({
      CompanyId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      name: Joi.string().required(),
      // email:Joi.string().required(),
      // number:Joi.number().required(),
      // logo:
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
