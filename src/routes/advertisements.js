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

router.get('/randomAdvertisement', advertisementController.getRandomOne);
router.post('/randomAdvertisements/:numberOfAdvertisements', advertisementController.createRandomAdvertisements);
router.post(
  '/clickAdverisement',
  validate(advertisementsValidator.clickAdvertisement),
  advertisementController.clickAdvertisement
);

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
