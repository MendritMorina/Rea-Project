// Imports: local files.
const authValidator = require('./auth');
const recommendationValidator = require('./recommendations');
const recommendationCardValidator = require('./recommendationCards');
const advertisementsValidator = require('./advertisements');
const couponValidator = require('./coupons');
const companyValidator = require('./companies');
const storyValidator = require('./stories');
const usedCouponValidator = require('./usedCoupons');

// Bundler object that is used to export all validations inside ./src/validations.
const bundler = {
  authValidator,
  couponValidator,
  companyValidator,
  storyValidator,
  usedCouponValidator,
  recommendationValidator,
  recommendationCardValidator,
  advertisementsValidator,
};
// Exports of this file.
module.exports = bundler;
