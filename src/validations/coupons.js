// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/coupons.
const validator = {
  getAllCoupons: {
    query: Joi.object({
      // description: Joi.string().required(),
      // discount: Joi.number().required(),
      // expirationDate: Joi.date().raw().required(),
      // company: Joi.array()
      //   .optional()
      //   .items(
      //     Joi.string()
      //       .regex(/^[0-9a-fA-F]{24}$/)
      //       .required()
      //   )
      //   .default(null),
    }),
  },
  createCoupon: {
    body: Joi.object({
      description: Joi.string().required(),
      discount: Joi.number().required(),
      expirationDate: Joi.date().raw().required(),
      company: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
  },
  updateCoupon: {
    params: Joi.object({
      couponId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    body: Joi.object({
      description: Joi.string().required(),
      discount: Joi.number().required(),
      expirationDate: Joi.date().raw().required(),
      company: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
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
