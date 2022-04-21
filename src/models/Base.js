// Imports: third-party packages.
const mongoose = require('mongoose');

// Base Schema that is inherited from all the other models in our API.
const Base = {
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: {
    type: Date,
    required: false,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  updatedAt: {
    type: Date,
    required: false,
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
};

// Exports of this file.
module.exports = Base;
