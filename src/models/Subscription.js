// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Subscription Schema that is used to represent single Subscription in our API.
const SubscriptionSchema = new mongoose.Schema({
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionType',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: String,
    required: false,
    default: null,
  },
  transactionId: {
    type: String,
    required: false,
    default: null,
  },
  originalTransactionId: {
    type: String,
    required: false,
    default: null,
  },
  purchaseDate: {
    type: Date,
    required: false,
    default: null,
  },
  expirationDate: {
    type: Date,
    required: false,
    default: null,
  },
  receipt: {
    type: String,
    required: false,
    default: null,
  },
  markedExpiredAt: {
    type: Date,
    required: false,
    default: null,
  },
  ...Base,
});

// Plugins.
SubscriptionSchema.plugin(mongoosePaginate);
SubscriptionSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Subscription', SubscriptionSchema);
