// Imports: third-party packages.
const { default: mongoose } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Admin Schema that is used to represent single Admin in our API.
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ...Base,
});

// Plugins.
TechniqueSchema.plugin(mongoosePaginate);
TechniqueSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Admin', AdminSchema);
