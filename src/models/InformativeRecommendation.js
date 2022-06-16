const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

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
  baseRecommendations: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BaseRecommendation' }],
    required: true,
    default: [],
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
