// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Notification Schema that is used to represent single Notification in our API.
const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationType',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  ...Base,
});

// Plugins.
NotificationSchema.plugin(mongoosePaginate);
NotificationSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Notification', NotificationSchema);
