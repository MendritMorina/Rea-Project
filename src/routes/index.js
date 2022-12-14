// Imports: local files.
const authRouter = require('./auth');
const recommendationCardRouter = require('./recommendationCards');
const advertisementsRouter = require('./advertisements');
const usersRouter = require('./users');
const couponRouter = require('./coupons');
const companyRouter = require('./companies');
const storyRouter = require('./stories');
const usedCouponRouter = require('./usedCoupons');
const baseRecommendionRouter = require('./baseRecommendations');
const informativeRecommendionRouter = require('./InformativeRecommendations');
const aqiRouter = require('./aqi');
const subscriptionsRouter = require('./subscriptions');
const notificationsRouter = require('./notifications');
const notificationTypesRouter = require('./notificationTypes');

// Bundler object that is used to export all routes inside ./src/routes.
const bundler = {
  authRouter,
  couponRouter,
  companyRouter,
  storyRouter,
  usedCouponRouter,
  baseRecommendionRouter,
  informativeRecommendionRouter,
  recommendationCardRouter,
  advertisementsRouter,
  usersRouter,
  aqiRouter,
  subscriptionsRouter,
  notificationsRouter,
  notificationTypesRouter,
};

// Exports of this file.
module.exports = bundler;
