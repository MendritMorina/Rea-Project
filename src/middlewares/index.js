// Imports: local files.
const asyncHandler = require('./asyncHandler');
const errorHandler = require('./errorHandler');
const filterValues = require('./filterValues');

// Bundler object that is used to export all middlewares inside ./src/middlewares.
const bundler = { asyncHandler, errorHandler, filterValues };

// Exports of this file.
module.exports = bundler;
