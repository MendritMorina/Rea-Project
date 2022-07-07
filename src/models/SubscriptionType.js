// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// SubscriptionType Schema that is used to represent single SubscriptionType in our API.
const SubscriptionTypeSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['APPLE', 'PLAYSTORE'],
  },
  name: {
    type: String,
    required: false,
    default: null,
  },
  referenceName: {
    type: String,
    required: false,
    default: null,
  },
  productId: {
    type: String,
    required: false,
    default: null,
  },
  appleId: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
  occurrence: {
    type: String,
    required: false,
    default: null,
  },
  ...Base,
});

// Plugins.
SubscriptionTypeSchema.plugin(mongoosePaginate);
SubscriptionTypeSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('SubscriptionType', SubscriptionTypeSchema);
