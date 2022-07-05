// Imports: third-party packages.
const mongoose = require('mongoose');

// Cronjob Schema that is used to track success/failure of jobs.
const CronjobSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: false,
    default: null,
  },
  information: {
    type: Object,
    required: false,
    default: null,
  },
});

// Exports of this file.
module.exports = mongoose.model('Cronjob', CronjobSchema);
