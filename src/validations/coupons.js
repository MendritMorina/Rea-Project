// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/coupons.
const validator = {
  getAllCoupons: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
    }),
  },
  createCoupon: {
    body: Joi.object({
      discount: Joi.number().required(),
      startDate: Joi.date().required(),
      expirationDate: Joi.date().required(),
      type: Joi.string().required(),
      company: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
  },
  updateCoupon: {
    params: Joi.object({
      couponId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object({
      discount: Joi.number().required(),
      startDate: Joi.date().required(),
      expirationDate: Joi.date().required(),
      type: Joi.string().required(),
      company: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
  },
  validateCouponId: {
    params: Joi.object({
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
