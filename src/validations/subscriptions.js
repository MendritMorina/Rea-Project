// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/subscriptions.
const validator = {
  createApple: {
    body: Joi.object({
      receipt: Joi.string().required(),
      productId: Joi.string().required(),
      transactionId: Joi.string().optional(),
      originalTransactionId: Joi.string().optional(),
    }),
  },
  restoreApple: {
    body: Joi.object({
      receipt: Joi.string().required(),
      productId: Joi.string().required(),
      transactionId: Joi.string().required(),
      originalTransactionId: Joi.string().optional(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
