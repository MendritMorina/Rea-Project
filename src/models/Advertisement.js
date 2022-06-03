const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// Advertisement Schema that is used to represent single Advertisement in our API.
const AdvertisementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  photo: {
    ...File,
  },
  thumbnail: {
    ...File,
  },
  photoClickCounter: {
    type: Number,
    default: 0,
    required: true,
  },
  thumbnailClickCounter: {
    type: Number,
    default: 0,
    required: true,
  },
  viewCounter: {
    type: Number,
    default: 0,
    required: true,
  },
  priority: {
    type: Number,
    min: 1,
    max: 20,
    default: 1,
    required: false,
  },
  webLink: {
    type: String,
    default: '',
  },
  iosLink: {
    type: String,
    default: '',
  },
  androidLink: {
    type: String,
    default: '',
  },
  ...Base,
});

// Plugins.
AdvertisementSchema.plugin(mongoosePaginate);
AdvertisementSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Advertisement', AdvertisementSchema);
