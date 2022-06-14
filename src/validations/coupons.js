// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/coupons.
const validator = {
  getAllCoupons: {
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      expired: Joi.number().optional().default(0).allow(null, 0, 1),
    }),
  },
  createCoupon: {
    body: Joi.object({
      discount: Joi.number().required(),
      description: Joi.string().required(),
      startDate: Joi.date().required(),
      expirationDate: Joi.date().required(),
      type: Joi.string().required(),
      company: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  updateCoupon: {
    params: Joi.object({
      couponId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
    body: Joi.object({
      discount: Joi.number().optional(),
      description: Joi.string().optional(),
      startDate: Joi.date().optional(),
      expirationDate: Joi.date().optional(),
      type: Joi.string().optional(),
      company: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
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
