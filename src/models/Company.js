// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// Company Schema that is used to represent single Company in our API.
const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  number: {
    type: Number,
    required: true,
    unique: true,
  },
  logo: {
    ...File,
  },
  ...Base,
});

// Plugins.
CompanySchema.plugin(mongoosePaginate);
CompanySchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Company', CompanySchema);
