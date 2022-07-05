const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// AQI Schema that is used to represent single Advertisement in our API.
const AQISchema = new mongoose.Schema({
  localtime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  geometry: {
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
    required: true,
  },
  pm25: {
    type: Number,
    required: true,
  },
  so2: {
    type: Number,
    required: true,
  },
  no2: {
    type: Number,
    required: true,
  },
  o3: {
    type: Number,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Plugins.
AQISchema.plugin(mongoosePaginate);
AQISchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('AQISchema', AQISchema);
