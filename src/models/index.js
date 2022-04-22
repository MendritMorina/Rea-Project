// Imports: local files.
const User = require('./User');
const Recommandation = require('./Recommandation');
const RecommandationCard = require('./RecommandationCard');
const Subscription = require('./Subscription');
const SubscriptionType = require('./SubscriptionType');

// Bundler object that is used to export all models inside ./src/models.
const bundler = { User, Recommandation, RecommandationCard, Subscription, SubscriptionType };

// Exports of this file.
module.exports = bundler;
