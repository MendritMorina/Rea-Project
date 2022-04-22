const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Recommendation Schema that is used to represent single Recommendation in our API.
const RecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  weather: {
    type: String,
    required: false,
  },
  aqi: {
    type: Number,
    required: false,
  },
  haveDiseaseDiagnosis: {
    type: Array,
    required: true,
    default: [],
  },
  energySource: {
    type: Array,
    required: true,
    default: [],
  },
  hasChildren: {
    type: Boolean,
    required: true,
    default: false,
  },
  hasChildrenDisease: {
    type: Array,
    required: false,
    default: [],
  },
  recommendationCards: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecommendationCard' }],
    required: true,
    default: [],
  },
  category: {
    type: String,
    required: true,
  },
  ...Base,
});

// Plugins.
RecommendationSchema.plugin(mongoosePaginate);
RecommendationSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Recommendation', RecommendationSchema);
