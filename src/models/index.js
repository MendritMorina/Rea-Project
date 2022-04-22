// Imports: local files.
const User = require('./User');
const Recommendation = require('./Recommendation');
const RecommendationCard = require('./RecommendationCard');
const Subscription = require('./Subscription');
const SubscriptionType = require('./SubscriptionType');
const Admin = require('./Admin');
const Company = require('./Company');
const Coupon = require('./Coupon');
const Story = require('./Story');
const UsedCoupon = require('./UsedCoupon');

// Bundler object that is used to export all models inside ./src/models.
const bundler = {
  User,
  Recommendation,
  RecommendationCard,
  Subscription,
  SubscriptionType,
  Admin,
  Company,
  Coupon,
  Story,
  UsedCoupon,
};

// Exports of this file.
module.exports = bundler;
