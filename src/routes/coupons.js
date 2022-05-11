// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { couponController } = require('../controllers');
const { couponValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(couponValidator.getAllCoupons), couponController.getAll],
  },
  {
    path: '/:couponId',
    method: httpVerbs.GET,
    middlewares: [validate(couponValidator.validateCouponId), couponController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [validate(couponValidator.createCoupon), couponController.create],
  },
  {
    path: '/:couponId',
    method: httpVerbs.PUT,
    middlewares: [validate(couponValidator.updateCoupon), couponController.updateOne],
  },
  {
    path: '/:couponId',
    method: httpVerbs.DELETE,
    middlewares: [validate(couponValidator.validateCouponId), couponController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
