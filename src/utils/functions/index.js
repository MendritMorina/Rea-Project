// Imports: local files.
const env = require('./env');
const getMode = require('./getMode');
const db = require('./db');
const validate = require('./validate');

// Bundler object that is used to export all functions inside ./src/utils/functions.
const bundler = { env, getMode, db, validate };

// Exports of this file.
module.exports = bundler;
