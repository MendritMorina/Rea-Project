// Imports: local files.
const asyncHandler = require('./asyncHandler');
const errorHandler = require('./errorHandler');
const authorize = require('./authorize');
const authorizeAdmin = require('./authorizeAdmin');
const checkSubscription = require('./checkSubscription');

// Bundler object that is used to export all middlewares inside ./src/middlewares.
const bundler = { asyncHandler, errorHandler, authorize, authorizeAdmin, checkSubscription };

// Exports of this file.
module.exports = bundler;
