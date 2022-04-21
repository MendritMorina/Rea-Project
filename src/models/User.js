// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// User Schema that is used to represent single User in our API.
const UserSchema = new mongoose.Schema({
  ...Base,
});

// Plugins.
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('User', UserSchema);
