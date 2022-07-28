const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// Informative Recommendation Schema that is used to represent single Informative Recommendation in our API.
const InformativeRecommendationSchema = new mongoose.Schema({
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
    enum: ['E mirë', 'E pranueshme', 'Mesatare', 'E dobët', 'Shume e dobët'],
  },
  age: {
    type: Array,
    required: true,
  },
  energySource: {
    type: Array,
    required: true,
    default: [],
  },
  haveDiseaseDiagnosis: {
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
  isGeneric: {
    type: Boolean,
    required: false,
    default: false,
  },
  ...Base,
});

// Plugins.
InformativeRecommendationSchema.plugin(mongoosePaginate);
InformativeRecommendationSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('InformativeRecommendation', InformativeRecommendationSchema);
