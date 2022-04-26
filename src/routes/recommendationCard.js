// Imports: third-party packages.
const express = require('express');
const router = express.Router({ mergeParams: true });

// Imports: local files.
const { recommendationCardController } = require('../controllers');
//const { recommendationValidator } = require('../validations');
//const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    //middlewares: [validate(authValidator.signup), authController.signup],
    middlewares: [recommendationCardController.getAll],
  },
  {
    path: '/:id',
    method: httpVerbs.GET,
    middlewares: [recommendationCardController.getOne],
  },
  {
    path: '/create',
    method: httpVerbs.POST,
    middlewares: [recommendationCardController.create],
  },
  {
    path: '/:id',
    method: httpVerbs.DELETE,
    middlewares: [recommendationCardController.deleteOne],
  },
  {
    path: '/:id',
    method: httpVerbs.PUT,
    middlewares: [recommendationCardController.updateOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
