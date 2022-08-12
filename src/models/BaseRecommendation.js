const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// Base Recommendation Schema that is used to represent single Base Recommendation in our API.
const BaseRecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  thumbnail: {
    ...File,
  },
  airQuality: {
    type: String,
    required: false,
  },
  gender: {
    type: Array,
    required: true,
  },
  age: {
    type: Array,
    required: true,
  },
  haveDiseaseDiagnosis: {
    type: Array,
    required: true,
    default: [],
  },
  isPregnant: {
    type: Boolean,
    required: true,
    default: false,
  },
  recommendationCards: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecommendationCard' }],
    required: true,
    default: [],
  },
  ...Base,
});

// Plugins.
BaseRecommendationSchema.plugin(mongoosePaginate);
BaseRecommendationSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('BaseRecommendation', BaseRecommendationSchema);
