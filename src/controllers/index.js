// Imports: local files.
const authController = require('./auth');
const recommendationController = require('./recommendations');
const baseRecommendationController = require('./baseRecommendations');
const informativeRecommendationController = require('./InformativeRecommendations');
const recommendationCardController = require('./recommendationCards');
const advertisementController = require('./advertisements');
const userController = require('./users');
const couponController = require('./coupons');
const companyController = require('./companies');
const storyController = require('./stories');
const usedCouponController = require('./usedCoupons');
const aqiController = require('./aqi');
const subscriptionsController = require('./subscriptions');
const notificationsController = require('./notifications');
const notificationTypesController = require('./notificationTypes');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = {
  authController,
  couponController,
  companyController,
  storyController,
  usedCouponController,
  recommendationController,
  baseRecommendationController,
  informativeRecommendationController,
  recommendationCardController,
  advertisementController,
  userController,
  aqiController,
  subscriptionsController,
  notificationsController,
  notificationTypesController,
};

// Exports of this file.
module.exports = bundler;
