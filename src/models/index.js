// Imports: local files.
const User = require('./User');
const Recommendation = require('./Recommendation');
const RecommendationCard = require('./RecommendationCard');
const Subscription = require('./Subscription');
const SubscriptionType = require('./SubscriptionType');

// Bundler object that is used to export all models inside ./src/models.
const bundler = { User, Recommendation, RecommendationCard, Subscription, SubscriptionType };

// Exports of this file.
module.exports = bundler;
