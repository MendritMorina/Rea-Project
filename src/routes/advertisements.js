// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { advertisementController } = require('../controllers');
const { advertisementsValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(advertisementsValidator.getAllAdvertisements), advertisementController.getAll],
  },
  {
    path: '/randomAdvertisement',
    method: httpVerbs.GET,
    middlewares: [advertisementController.getRandomOne],
  },
  {
    path: '/clickAdvertisement',
    method: httpVerbs.POST,
    middlewares: [validate(advertisementsValidator.clickAdvertisement), advertisementController.clickAdvertisement],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.GET,
    middlewares: [validate(advertisementsValidator.validateAdvertisement), advertisementController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [validate(advertisementsValidator.createAdvertisement), advertisementController.create],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.PUT,
    middlewares: [validate(advertisementsValidator.updateAdvertisement), advertisementController.updateOne],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.DELETE,
    middlewares: [validate(advertisementsValidator.validateAdvertisement), advertisementController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
