// Imports: local files.
const authController = require('./auth');
const couponController = require('./coupons');
const companyController = require('./companies');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = { authController, couponController, companyController };

// Exports of this file.
module.exports = bundler;
