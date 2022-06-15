// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const recommendationCardRouter = require('./recommendationCards');
const { informativeRecommendationController } = require('../controllers');
const { informativeRecommendationValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [
      validate(informativeRecommendationValidator.getAllInformativeRecommendations),
      informativeRecommendationController.getAll,
    ],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.GET,
    middlewares: [
      validate(informativeRecommendationValidator.validateInformativeRecommendationId),
      informativeRecommendationController.getOne,
    ],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [
      authorizeAdmin,
      validate(informativeRecommendationValidator.createInformativeRecommendation),
      informativeRecommendationController.create,
    ],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.PUT,
    middlewares: [
      authorizeAdmin,
      validate(informativeRecommendationValidator.updateInformativeRecommendation),
      informativeRecommendationController.updateOne,
    ],
  },
  {
    path: '/:informativeRecommendationId',
    method: httpVerbs.DELETE,
    middlewares: [
      authorizeAdmin,
      validate(informativeRecommendationValidator.validateInformativeRecommendationId),
      informativeRecommendationController.deleteOne,
    ],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

router.use('/:informativeRecommendationId/recommendationcards', recommendationCardRouter);

// Exports of this file.
module.exports = router;
