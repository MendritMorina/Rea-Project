// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { aqiController } = require('../controllers');
const { aqiValidator } = require('../validations');
const { httpVerbs } = require('../configs');
const { validate } = require('../utils/functions');

// Define routes here.
const routes = [
  {
    path: '/links',
    method: httpVerbs.GET,
    middlewares: [aqiController.getAqiLinks],
  },
  {
    path: '/predictions',
    method: httpVerbs.GET,
    middlewares: [validate(aqiValidator.getPredictions), aqiController.getPredictions],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
