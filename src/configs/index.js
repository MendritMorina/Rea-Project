// Imports: local files.
const httpCodes = require('./httpCodes');
const httpVerbs = require('./httpVerbs');
const env = require('./env');

// Bundler object that is used to export all configs inside ./src/configs.
const bundler = { httpCodes, httpVerbs, env };

// Exports of this file.
module.exports = bundler;
