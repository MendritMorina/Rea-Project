// Imports: local files.
const authController = require('./auth');
const recommendationController = require('./recommendations');
const recommendationCardController = require('./recommendationCards');
const advertisementController = require('./advertisements');
const userController = require('./users');

// Bundler object that is used to export all controllers inside ./src/controllers.
const bundler = {
  authController,
  recommendationController,
  recommendationCardController,
  advertisementController,
  userController,
};

// Exports of this file.
module.exports = bundler;
