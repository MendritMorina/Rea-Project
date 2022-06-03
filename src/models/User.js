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
    required: false,
  },
  surname: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  age: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  haveDiseaseDiagnosis: {
    type: Array,
    required: false,
    default: [],
  },
  energySource: {
    type: Array,
    required: false,
    default: [],
  },
  isPregnant: {
    type: Boolean,
    required: false,
    default: false,
  },
  hasChildren: {
    type: Boolean,
    required: false,
    default: false,
  },
  hasChildrenDisease: {
    type: Array,
    required: false,
    default: [],
  },
  providerId: {
    type: String,
    required: false,
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
