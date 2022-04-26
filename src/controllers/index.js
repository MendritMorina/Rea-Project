// Imports: local files.
const authController = require('./auth');
const recommendationController = require('./recommendation');
const recommendationCardController = require('./recommendationCard');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = { authController, recommendationController, recommendationCardController };

// Exports of this file.
module.exports = bundler;
