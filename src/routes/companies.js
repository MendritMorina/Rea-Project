// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { getAll, getOne, create, updateOne, deleteOne } = require('../controllers/companies');
const { getAllCompanies, createCompany, updateCompany, validateCompanyId } = require('../validations/companies');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(getAllCompanies), getAll],
  },
  {
    path: '/:companyId',
    method: httpVerbs.GET,
    middlewares: [validate(validateCompanyId), getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [validate(createCompany), create],
  },
  {
    path: '/:companyId',
    method: httpVerbs.PUT,
    middlewares: [validate(updateCompany), updateOne],
  },
  {
    path: '/:companyId',
    method: httpVerbs.DELETE,
    middlewares: [validate(validateCompanyId), deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
