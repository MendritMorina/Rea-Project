// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// UsersCoupon Schema that is used to represent single UsersCoupon in our API.
const UserCouponsSchema = new mongoose.Schema({
  cuponID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  cuponCode: {
    type: String,
    required: true,
  },
  crateDate: {
    type: Date,
    required: true,
  },
  ...Base,
});

// Plugins.
TechniqueSchema.plugin(mongoosePaginate);
TechniqueSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('UserCoupons', UserCouponsSchema);
