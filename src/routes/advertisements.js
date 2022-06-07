// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { advertisementController } = require('../controllers');
const { advertisementsValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize, authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(advertisementsValidator.getAllAdvertisements), advertisementController.getAll],
  },
  {
    path: '/random',
    method: httpVerbs.GET,
    middlewares: [authorize, advertisementController.getRandomOne],
  },
  {
    path: '/click',
    method: httpVerbs.POST,
    middlewares: [
      authorize,
      validate(advertisementsValidator.clickAdvertisement),
      advertisementController.clickAdvertisement,
    ],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.GET,
    middlewares: [validate(advertisementsValidator.validateAdvertisement), advertisementController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [
      authorizeAdmin,
      validate(advertisementsValidator.createAdvertisement),
      advertisementController.create,
    ],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.PUT,
    middlewares: [
      authorizeAdmin,
      validate(advertisementsValidator.updateAdvertisement),
      advertisementController.updateOne,
    ],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.DELETE,
    middlewares: [
      authorizeAdmin,
      validate(advertisementsValidator.validateAdvertisement),
      advertisementController.deleteOne,
    ],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
