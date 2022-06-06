// Imports: local files.
const httpCodes = require('./httpCodes');
const httpVerbs = require('./httpVerbs');
const staticValues = require('./staticValues');
const env = require('./env');

// Bundler object that is used to export all configs inside ./src/configs.
const bundler = { httpCodes, httpVerbs, env, staticValues };

// Exports of this file.
module.exports = bundler;
