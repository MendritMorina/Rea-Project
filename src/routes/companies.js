// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { companyController } = require('../controllers');
const { companyValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(companyValidator.getAllCompanies), companyController.getAll],
  },
  {
    path: '/:companyId',
    method: httpVerbs.GET,
    middlewares: [validate(companyValidator.validateCompanyId), companyController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorizeAdmin, validate(companyValidator.createCompany), companyController.create],
  },
  {
    path: '/:companyId',
    method: httpVerbs.PUT,
    middlewares: [authorizeAdmin, validate(companyValidator.updateCompany), companyController.updateOne],
  },
  {
    path: '/:companyId',
    method: httpVerbs.DELETE,
    middlewares: [authorizeAdmin, validate(companyValidator.validateCompanyId), companyController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
