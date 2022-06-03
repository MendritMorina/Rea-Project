// Imports: local files.
const httpCodes = require('./httpCodes');
const httpVerbs = require('./httpVerbs');
const userQuestions = require('./userQuestions');
const env = require('./env');

// Bundler object that is used to export all configs inside ./src/configs.
const bundler = { httpCodes, httpVerbs, env, userQuestions };

// Exports of this file.
module.exports = bundler;
