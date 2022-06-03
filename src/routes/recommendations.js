// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { recommendationController } = require('../controllers');
const { recommendationValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

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
    middlewares: [
      authorizeAdmin,
      validate(recommendationValidator.createRecommendation),
      recommendationController.create,
    ],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.PUT,
    middlewares: [
      authorizeAdmin,
      validate(recommendationValidator.updateRecommendation),
      recommendationController.updateOne,
    ],
  },
  {
    path: '/:recommendationId',
    method: httpVerbs.DELETE,
    middlewares: [
      authorizeAdmin,
      validate(recommendationValidator.validateRecommendationId),
      recommendationController.deleteOne,
    ],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:recommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
