// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { getAll, getOne, create, updateOne, deleteOne } = require('../controllers/coupons');
const { getAllCoupons, createCoupon, updateCoupon, validateCouponId } = require('../validations/coupons');
const { validate } = require('../utils/functions');
const { authorize, protect } = require('../middlewares');
const {
  httpVerbs,
  roles: { ADMIN },
} = require('../config');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(getAllCoupons), getAll],
  },
  {
    path: '/:couponId',
    method: httpVerbs.GET,
    middlewares: [validate(validateCouponId), getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorize, protect(ADMIN), validate(createCoupon), create],
  },
  {
    path: '/:couponId',
    method: httpVerbs.PUT,
    middlewares: [authorize, protect(ADMIN), validate(updateCoupon), updateOne],
  },
  {
    path: '/:couponId',
    method: httpVerbs.DELETE,
    middlewares: [authorize, protect(ADMIN), validate(validateCouponId), deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
