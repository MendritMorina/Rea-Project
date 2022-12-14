// Imports: third-party packages.
const express = require('express');
const router = express.Router({ mergeParams: true });

// Imports: local files.
const { recommendationCardController } = require('../controllers');
const { recommendationCardValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize, authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(recommendationCardValidator.getAllRecommendationCards), recommendationCardController.getAll],
  },
  {
    path: '/randomInformativeRecommendationCards',
    method: httpVerbs.GET,
    middlewares: [
      authorize,
      validate(recommendationCardValidator.coordinatesValidation),
      recommendationCardController.getRandomInformativeRecommendationCards,
    ],
  },
  {
    path: '/currentAQI',
    method: httpVerbs.POST,
    middlewares: [
      authorize,
      validate(recommendationCardValidator.coordinatessValidation),
      recommendationCardController.createCurrentAQI,
    ],
  },
  {
    path: '/baseRecommendationCards',
    method: httpVerbs.GET,
    middlewares: [
      authorize,
      validate(recommendationCardValidator.coordinatesValidation),
      recommendationCardController.getBaseRecommendationCards,
    ],
  },
  {
    path: '/view/:recommendationCardId',
    method: httpVerbs.GET,
    middlewares: [authorize, recommendationCardController.viewCardCounter],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.GET,
    middlewares: [
      validate(recommendationCardValidator.validateRecommendationCardId),
      recommendationCardController.getOne,
    ],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [
      authorizeAdmin,
      validate(recommendationCardValidator.createRecommendationCard, {
        joiOptions: { allowUnknown: true, abortEarly: false },
      }),
      recommendationCardController.create,
    ],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.PUT,
    middlewares: [
      authorizeAdmin,
      validate(recommendationCardValidator.updateRecommendationCard, {
        joiOptions: { allowUnknown: true, abortEarly: false },
      }),
      recommendationCardController.updateOne,
    ],
  },
  {
    path: '/:recommendationCardId',
    method: httpVerbs.DELETE,
    middlewares: [
      authorizeAdmin,
      validate(recommendationCardValidator.validateRecommendationCardId),
      recommendationCardController.deleteOne,
    ],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
