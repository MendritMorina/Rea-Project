// Imports: local files.
const authRouter = require('./auth');

// Bundler object that is used to export all routes inside ./src/routes.
const bundler = { authRouter };

// Exports of this file.
module.exports = bundler;
