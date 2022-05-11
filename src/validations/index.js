// Imports: local files.
const authValidator = require('./auth');
const recommendationValidator = require('./recommendations');
const recommendationCardValidator = require('./recommendationCards');

// Bundler object that is used to export all validations inside ./src/validations.
const bundler = { authValidator, recommendationValidator, recommendationCardValidator };

// Exports of this file.
module.exports = bundler;
