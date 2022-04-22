// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// UsedCoupon Schema that is used to represent single UsedCoupon in our API.
const UsedCouponSchema = new mongoose.Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  ...Base,
});

// Plugins.
UsedCouponSchema.plugin(mongoosePaginate);
UsedCouponSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('UsedCoupon', UsedCouponSchema);
