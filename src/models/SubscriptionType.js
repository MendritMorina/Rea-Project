const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// SubscriptionType Schema that is used to represent single SubscriptionType in our API.
const SubscriptionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['MUJOR', 'VJETOR'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  ...Base,
});

// Plugins.
SubscriptionTypeSchema.plugin(mongoosePaginate);
SubscriptionTypeSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('SubscriptionType', SubscriptionTypeSchema);
