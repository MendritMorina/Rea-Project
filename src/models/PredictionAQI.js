// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Prediction AQI Schema that is used to represent single Prediction AQI in our API.
const PredictionAQISchema = new mongoose.Schema({
  localtime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  longitude: {
    type: Number,
    required: false,
    default: null,
  },
  latitude: {
    type: Number,
    required: false,
    default: null,
  },
  location: {
    type: {
      type: String,
      required: true,
    },
    coordinates: {
      type: Array,
      default: [],
    },
  },
  pm10: {
    type: Number,
    required: false,
  },
  pm25: {
    type: Number,
    required: false,
  },
  so2: {
    type: Number,
    required: false,
  },
  no2: {
    type: Number,
    required: false,
  },
  o3: {
    type: Number,
    required: false,
  },
  index: {
    type: Number,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
});

// Plugins.
PredictionAQISchema.plugin(mongoosePaginate);
PredictionAQISchema.plugin(mongooseAggregatePaginate);

// Indexes.
PredictionAQISchema.index({ location: '2dsphere' });
PredictionAQISchema.index({ longitude: 1 });
PredictionAQISchema.index({ latitude: 1 });

// Exports of this file.
module.exports = mongoose.model('PredictionAQISchema', PredictionAQISchema);
