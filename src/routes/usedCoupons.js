// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { usedCouponController } = require('../controllers');
const { usedCouponValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorize, validate(usedCouponValidator.createUsedCoupon), usedCouponController.create],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
