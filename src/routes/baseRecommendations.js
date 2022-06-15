// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { baseRecommendationController } = require('../controllers');
const { baseRecommendationValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(baseRecommendationValidator.getAllBaseRecommendations), baseRecommendationController.getAll],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.GET,
    middlewares: [
      validate(baseRecommendationValidator.validateBaseRecommendationId),
      baseRecommendationController.getOne,
    ],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [
      authorizeAdmin,
      validate(baseRecommendationValidator.createBaseRecommendation),
      baseRecommendationController.create,
    ],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.PUT,
    middlewares: [
      authorizeAdmin,
      validate(baseRecommendationValidator.updateBaseRecommendation),
      baseRecommendationController.updateOne,
    ],
  },
  {
    path: '/:baseRecommendationId',
    method: httpVerbs.DELETE,
    middlewares: [
      authorizeAdmin,
      validate(baseRecommendationValidator.validateBaseRecommendationId),
      baseRecommendationController.deleteOne,
    ],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:baseRecommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
