const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Subscription Schema that is used to represent single Subscription in our API.
const SubscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionType',
    required: true,
  },
  ...Base,
});

// Plugins.
SubscriptionSchema.plugin(mongoosePaginate);
SubscriptionSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Subscription', SubscriptionSchema);
