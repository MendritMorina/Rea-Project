// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { subscriptionsController } = require('../controllers');
const { subscriptionsValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/apple',
    method: httpVerbs.POST,
    middlewares: [authorize, validate(subscriptionsValidator.createApple), subscriptionsController.createApple],
  },
  {
    path: '/me',
    method: httpVerbs.POST,
    middlewares: [authorize, subscriptionsController.me],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
