// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { usedCouponController } = require('../controllers');
const { usedCouponValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize, authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [authorizeAdmin, validate(usedCouponValidator.getAll), usedCouponController.getAll],
  },
  {
    path: '/:couponCode',
    method: httpVerbs.GET,
    middlewares: [validate(usedCouponValidator.getOne), usedCouponController.getOne],
  },
  {
    path: '/:couponId/number',
    method: httpVerbs.GET,
    middlewares: [authorizeAdmin, validate(usedCouponValidator.validateCouponId), usedCouponController.getNumberOfUses],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorize, validate(usedCouponValidator.create), usedCouponController.create],
  },
  {
    path: '/use',
    method: httpVerbs.POST,
    middlewares: [validate(usedCouponValidator.use), usedCouponController.use],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
