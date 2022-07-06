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
  location: {
    // GeoJSON Point
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: Array,
        index: '2dsphere',
      },
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  // geometry: {
  //   type: {
  //     type: String,
  //     required: true,
  //   },
  //   coordinates: {
  //     type: Array,
  //     default: [],
  //   },
  // },
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

AQISchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

// Plugins.
AQISchema.plugin(mongoosePaginate);
AQISchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('AQISchema', AQISchema);
