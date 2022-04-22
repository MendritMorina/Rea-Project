const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');

const RecommandationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  recommandationCards: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecommandationCard' }],
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
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Recommandation', RecommandationSchema);
