// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { recommendationController } = require('../controllers');
const { recommendationValidator } = require('../validations');
const { validate } = require('../utils/functions');
const recommendationCardRouter = require('./recommendationCards');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(recommendationValidator.getAllRecommendations), recommendationController.getAll],
  },
  {
    path: '/randomRecCardFromRec',
    method: httpVerbs.GET,
    middlewares: [recommendationController.getRandomOne],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.GET,
    middlewares: [validate(recommendationValidator.validateRecommendationId), recommendationController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [validate(recommendationValidator.createRecommendation), recommendationController.create],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.PUT,
    middlewares: [validate(recommendationValidator.updateRecommendation), recommendationController.updateOne],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.DELETE,
    middlewares: [validate(recommendationValidator.validateRecommendationId), recommendationController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

//router.use('/:recommendationId', recommendationCardRouter);
router.use('/:recommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
