// Imports: local files.
const authValidator = require('./auth');

// Bundler object that is used to export all validations inside ./src/validations.
const bundler = { authValidator };

// Exports of this file.
module.exports = bundler;
