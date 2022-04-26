// Imports: local files.
const authRouter = require('./auth');
const recommendationRouter = require('./recommendation');
const recommendationCardRouter = require('./recommendationCard');

// Bundler object that is used to export all routes inside ./src/routes.
const bundler = { authRouter, recommendationRouter, recommendationCardRouter };

// Exports of this file.
module.exports = bundler;
