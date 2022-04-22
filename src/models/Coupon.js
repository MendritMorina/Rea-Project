// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Coupon Schema that is used to represent single Coupon in our API.
const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  experationDate: {
    type: Date,
    default: Date.now,
  },
  company: {},
  ...Base,
});

// Plugins.
TechniqueSchema.plugin(mongoosePaginate);
TechniqueSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Coupon', CouponSchema);
