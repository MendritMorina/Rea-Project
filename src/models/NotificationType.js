// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Notification Type Schema that is used to represent single Notification Type in our API.
const NotificationTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  showName: {
    type: String,
    required: true,
  },
  ...Base,
});

// Plugins.
NotificationTypeSchema.plugin(mongoosePaginate);
NotificationTypeSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('NotificationType', NotificationTypeSchema);
