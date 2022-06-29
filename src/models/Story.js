// Imports: third-party packages.
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Imports: local files.
const Base = require('./Base');
const File = require('./File');

// Story Schema that is used to represent single Story in our API.
const StorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    ...File,
  },
  audio: {
    ...File,
  },
  backgroundImage: {
    ...File,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorSurname: {
    type: String,
    required: true,
  },
  narratorName: {
    type: String,
    required: true,
  },
  narratorSurname: {
    type: String,
    required: true,
  },
  narratorPhoto: {
    ...File,
  },
  category: {
    type: String,
    enum: ['Child', 'Adult'],
    required: false,
  },
  ...Base,
});

// Plugins.
StorySchema.plugin(mongoosePaginate);
StorySchema.plugin(mongooseAggregatePaginate);

// Exports of this file.
module.exports = mongoose.model('Story', StorySchema);
