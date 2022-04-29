// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { couponController } = require('../controllers');
//const { couponValidator } = require('../validations');
//const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [couponController.getAll],
  },
  {
    path: '/:couponId',
    method: httpVerbs.GET,
    middlewares: [couponController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [couponController.create],
  },
  {
    path: '/:couponId',
    method: httpVerbs.PUT,
    middlewares: [couponController.updateOne],
  },
  {
    path: '/:couponId',
    method: httpVerbs.DELETE,
    middlewares: [couponController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
