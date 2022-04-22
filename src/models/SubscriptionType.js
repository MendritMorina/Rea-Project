const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

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
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('SubscriptionType', SubscriptionTypeSchema);
