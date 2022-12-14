// Imports: local files.
const authValidator = require('./auth');
const recommendationCardValidator = require('./recommendationCards');
const advertisementsValidator = require('./advertisements');
const couponValidator = require('./coupons');
const companyValidator = require('./companies');
const storyValidator = require('./stories');
const usedCouponValidator = require('./usedCoupons');
const informativeRecommendationValidator = require('./informativeRecommendations');
const baseRecommendationValidator = require('./baseRecommendations');
const subscriptionsValidator = require('./subscriptions');
const notificationsValidator = require('./notifications');
const notificationTypesValidator = require('./notificationTypes');
const aqiValidator = require('./aqi');

// Bundler object that is used to export all validations inside ./src/validations.
const bundler = {
  authValidator,
  couponValidator,
  companyValidator,
  storyValidator,
  usedCouponValidator,
  recommendationCardValidator,
  advertisementsValidator,
  informativeRecommendationValidator,
  baseRecommendationValidator,
  subscriptionsValidator,
  notificationsValidator,
  notificationTypesValidator,
  aqiValidator,
};
// Exports of this file.
module.exports = bundler;
