// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/usedCoupons.
const validator = {
  create: {
    body: Joi.object({
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  getOne: {
    params: Joi.object({
      couponCode: Joi.string().required(),
    }),
  },
  getAll: {
    params: Joi.object({
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    query: Joi.object({
      page: Joi.number().optional().default(1),
      limit: Joi.number().optional().default(10),
      pagination: Joi.boolean().optional().default(true),
      type: Joi.string().optional().default(null).allow(null, 'singular', 'plural'),
      company: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .default(null),
      user: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .default(null),
      isUsed: Joi.number().optional().default(1).allow(null, 0, 1),
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .default(null),
    }),
  },
  use: {
    body: Joi.object({
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
      couponCode: Joi.string().required(),
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
