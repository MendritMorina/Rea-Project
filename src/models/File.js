// File Schema that is inherited to some fields in our models in our API.
const File = {
  uuid: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: Object,
  required: false,
  default: null,
};

// Exports of this file.
module.exports = File;
