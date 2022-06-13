const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

// Recommendation Schema that is used to represent single Recommendation in our API.
const BaseRecommendationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  aqi: {
    type: Number,
    required: false,
  },
  airQuality: {
    type: String,
    required: false,
    enum: ['E mire', 'E pranueshme', 'Mesatare', 'E dobet', 'Shume e dobet'],
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
  energySource: {
    type: Array,
    required: true,
    default: [],
  },
  isPregnant: {
    type: Boolean,
    required: true,
    default: false,
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
  informativeRecommendations: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InformativeRecommendation' }],
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
