// Imports: third-party packages.
const { Joi } = require('express-validation');

// Validator object that holds validation related to the controller in ./src/controllers/subscriptions.
const validator = {
  createApple: {
    body: Joi.object({
      receipt: Joi.string().required(),
      productId: Joi.string().required(),
      originalTransactionId: Joi.string().required(),
    }),
  },
  restoreApple: {
    body: Joi.object({
      receipt: Joi.string().required(),
      productId: Joi.string().required(),
      originalTransactionId: Joi.string().required(),
    }),
  },
};

// Exports of this file.
module.exports = validator;
