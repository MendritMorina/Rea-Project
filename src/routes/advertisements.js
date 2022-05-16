// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { advertisementController } = require('../controllers');
//const { advertisementValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [advertisementController.getAll],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.GET,
    middlewares: [advertisementController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [advertisementController.create],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.PUT,
    middlewares: [advertisementController.updateOne],
  },
  {
    path: '/:advertisementId',
    method: httpVerbs.DELETE,
    middlewares: [advertisementController.deleteOne],
  },
];

router.get('/randomAdvertisement', advertisementController.getRandomOne);
router.post('/randomAdvertisements/:numberOfAdvertisements', advertisementController.createRandomAdvertisements);
router.post('/clickAdverisement', advertisementController.clickAdverisement);

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
