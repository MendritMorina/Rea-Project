// Imports: local files.
const asyncHandler = require('./asyncHandler');
const errorHandler = require('./errorHandler');
const authorize = require('./authorize');
const authorizeAdmin = require('./authorizeAdmin');

// Bundler object that is used to export all middlewares inside ./src/middlewares.
const bundler = { asyncHandler, errorHandler, authorize, authorizeAdmin };

// Exports of this file.
module.exports = bundler;
