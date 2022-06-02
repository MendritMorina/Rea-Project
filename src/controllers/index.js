// Imports: local files.
const authController = require('./auth');
const couponController = require('./coupons');
const companyController = require('./companies');
const storyController = require('./stories');
const usedCouponController = require('./usedCoupons');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = { authController, couponController, companyController, storyController, usedCouponController };

// Exports of this file.
module.exports = bundler;
