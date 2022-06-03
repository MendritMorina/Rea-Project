// Imports: local files.
const authRouter = require('./auth');
const recommendationRouter = require('./recommendations');
const recommendationCardRouter = require('./recommendationCards');
const advertisementsRouter = require('./advertisements');
const usersRouter = require('./users');

// Bundler object that is used to export all routes inside ./src/routes.
const bundler = { authRouter, recommendationRouter, recommendationCardRouter, advertisementsRouter, usersRouter };

// Exports of this file.
module.exports = bundler;
