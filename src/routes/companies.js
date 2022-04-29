// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { companyController } = require('../controllers');
//const { companyValidator } = require('../validations');
//const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [companyController.getAll],
  },
  {
    path: '/:companyId',
    method: httpVerbs.GET,
    middlewares: [companyController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [companyController.create],
  },
  {
    path: '/:companyId',
    method: httpVerbs.PUT,
    middlewares: [companyController.updateOne],
  },
  {
    path: '/:companyId',
    method: httpVerbs.DELETE,
    middlewares: [companyController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
