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
    type: String,
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
  firebaseUid: {
    type: String,
    unique: true,
    required: true,
  },
  firebaseToken: {
    type: String,
    required: false,
  },
  currentSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: false,
  },
  pastSubscriptions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }],
    required: false,
    default: [],
  },
  ...Base,
});

// Plugins.
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('User', UserSchema);
