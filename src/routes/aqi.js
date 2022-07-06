// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { aqiController } = require('../controllers');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [aqiController.getAqiLinks],
  },
  {
    path: '/radius',
    method: httpVerbs.GET,
    middlewares: [aqiController.getaqiInRadius],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
