// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { informativeRecommendationController } = require('../controllers');
// const { recommendationValidator } = require('../validations');
// const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [informativeRecommendationController.getAll],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.GET,
    middlewares: [informativeRecommendationController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorizeAdmin, informativeRecommendationController.create],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.PUT,
    middlewares: [authorizeAdmin, informativeRecommendationController.updateOne],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.DELETE,
    middlewares: [authorizeAdmin, informativeRecommendationController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:informativeRecommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;