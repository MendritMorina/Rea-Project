// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/usedCoupons.
const validator = {
  createUsedCoupon: {
    body: Joi.object({
      coupon: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      user: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  validateUsedCouponId: {
    params: Joi.object({
      usedCouponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
