// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { recommendationController } = require('../controllers');
//const { recommendationValidator } = require('../validations');
//const { validate } = require('../utils/functions');
const recommendationCardRouter = require('./recommendationCard');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [recommendationController.getAll],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.GET,
    middlewares: [recommendationController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [recommendationController.create],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.PUT,
    middlewares: [recommendationController.updateOne],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.DELETE,
    middlewares: [recommendationController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

//router.use('/:recommendationId', recommendationCardRouter);
router.use('/:recommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
