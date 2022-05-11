// Imports: local files.
const authValidator = require('./auth');
const couponValidator = require('./coupons');
const companyValidator = require('./companies');
// Bundler object that is used to export all validations inside ./src/validations.
const bundler = { authValidator, couponValidator, companyValidator };
// Exports of this file.
module.exports = bundler;
