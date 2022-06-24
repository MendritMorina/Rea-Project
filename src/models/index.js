// Imports: local files.
const User = require('./User');
const Recommendation = require('./Recommendation');
const BaseRecommendation = require('./BaseRecommendation');
const InformativeRecommendation = require('./InformativeRecommendation');
const RecommendationCard = require('./RecommendationCard');
const Subscription = require('./Subscription');
const SubscriptionType = require('./SubscriptionType');
const Admin = require('./Admin');
const Company = require('./Company');
const Coupon = require('./Coupon');
const Story = require('./Story');
const UsedCoupon = require('./UsedCoupon');
const Advertisement = require('./Advertisement');

// Bundler object that is used to export all models inside ./src/models.
const bundler = {
  User,
  Recommendation,
  BaseRecommendation,
  InformativeRecommendation,
  RecommendationCard,
  Subscription,
  SubscriptionType,
  Admin,
  Company,
  Coupon,
  Story,
  UsedCoupon,
  Advertisement,
};

// Exports of this file.
module.exports = bundler;
