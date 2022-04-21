// Imports: local files.
const authController = require('./auth');

// Bundler object that is used to export all controllers inside ./sr/controllers.
const bundler = { authController };

// Exports of this file.
module.exports = bundler;
