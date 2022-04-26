// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { getAll, getOne, create, updateOne, deleteOne } = require('../controllers/companies');
const { getAllCompanies, createCompany, updateCompany, validateCompanyId } = require('../validations/companies');
const { validate } = require('../utils/functions');
const { authorize, protect } = require('../middlewares');
const {
  httpVerbs,
  roles: { ADMIN },
} = require('../config');

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
    middlewares: [authorize, protect(ADMIN), validate(createCompany), create],
  },
  {
    path: '/:companyId',
    method: httpVerbs.PUT,
    middlewares: [authorize, protect(ADMIN), validate(updateCompany), updateOne],
  },
  {
    path: '/:companyId',
    method: httpVerbs.DELETE,
    middlewares: [authorize, protect(ADMIN), validate(validateCompanyId), deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
