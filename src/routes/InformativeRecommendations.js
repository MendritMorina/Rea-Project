// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { informativeRecommendationController } = require('../controllers');
// const { recommendationValidator } = require('../validations');
// const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [informativeRecommendationController.getAll],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.GET,
    middlewares: [informativeRecommendationController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [informativeRecommendationController.create],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.PUT,
    middlewares: [informativeRecommendationController.updateOne],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.DELETE,
    middlewares: [informativeRecommendationController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:recommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
