// Imports: local files.
const authController = require('./auth');
const recommendationController = require('./recommendations');
const recommendationCardController = require('./recommendationCards');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = { authController, recommendationController, recommendationCardController };

// Exports of this file.
module.exports = bundler;
