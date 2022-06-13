const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// RecommendationCard Schema that is used to represent single RecommendationCard in our API.
const RecommendationCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  small: {
    ...File,
  },
  medium: {
    ...File,
  },
  large: {
    ...File,
  },
  thumbnail: {
    ...File,
  },
  // recommendation: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Recommendation',
  //   required: false,
  // },
  recommendation: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  type: {
    type: String,
    required: false,
    enum: ['base', 'informative'],
  },
  ...Base,
});

// Plugins.
RecommendationCardSchema.plugin(mongoosePaginate);
RecommendationCardSchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('RecommendationCard', RecommendationCardSchema);
