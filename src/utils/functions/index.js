// Imports: local files.
const env = require('./env');
const getMode = require('./getMode');
const db = require('./db');
const jwt = require('./jwt');
const validate = require('./validate');
const startup = require('./startup');

// Bundler object that is used to export all functions inside ./src/utils/functions.
const bundler = { env, getMode, db, jwt, validate, startup };

// Exports of this file.
module.exports = bundler;
