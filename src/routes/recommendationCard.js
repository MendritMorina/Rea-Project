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
    middlewares: [recommendationCardController.getAll],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.GET,
    middlewares: [recommendationCardController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [recommendationCardController.create],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.PUT,
    middlewares: [recommendationCardController.updateOne],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.DELETE,
    middlewares: [recommendationCardController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
