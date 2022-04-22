// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// User Schema that is used to represent single User in our API.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: String, // in form of range [20 - 30], ... etj
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  haveDiseaseDiagnosis: {
    type: Array,
    required: true,
    default: [],
  },
  energySource: {
    type: Array,
    required: true,
    default: [],
  },
  weather: {
    type: String,
    required: false,
  },
  aqi: {
    type: Number,
    required: false,
  },
  hasChildren: {
    type: Boolean,
    required: true,
    default: false,
  },
  hasChildrenDisease: {
    type: Array,
    required: false,
    default: [],
  },
  fireBaseToken: {
    type: String,
    required: false,
  },
  currentSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  pastSubscriptions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
    required: true,
    default: [],
  },
  ...Base,
});

// Plugins.
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('User', UserSchema);
