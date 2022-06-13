// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { baseRecommendationController } = require('../controllers');
// const { recommendationValidator } = require('../validations');
// const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [baseRecommendationController.getAll],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.GET,
    middlewares: [baseRecommendationController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [baseRecommendationController.create],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.PUT,
    middlewares: [baseRecommendationController.updateOne],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.DELETE,
    middlewares: [baseRecommendationController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:baseRecommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
