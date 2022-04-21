// Imports: core node modules.
const path = require('path');

// Imports: third-party packages.
const dotenv = require('dotenv');

// Load .env variables.
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Config object that is used to store .env variables used in our API.
const config = {
  development: {
    nodeEnv: process.env.NODE_ENV,
    nodePort: process.env.NODE_PORT,
    mongoHost: process.env.MONGO_HOST,
    mongoPort: process.env.MONGO_PORT,
    mongoName: process.env.MONGO_NAME,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  staging: {
    nodeEnv: process.env.NODE_ENV,
    nodePort: process.env.NODE_PORT,
    mongoHost: process.env.MONGO_HOST,
    mongoPort: process.env.MONGO_PORT,
    mongoName: process.env.MONGO_NAME,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  production: {
    nodeEnv: process.env.NODE_ENV,
    nodePort: process.env.NODE_PORT,
    mongoHost: process.env.MONGO_HOST,
    mongoPort: process.env.MONGO_PORT,
    mongoName: process.env.MONGO_NAME,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  requiredKeys: [
    'NODE_ENV',
    'NODE_PORT',
    'MONGO_HOST',
    'MONGO_PORT',
    'MONGO_NAME',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
  ],
};

// Exports of this file.
module.exports = config;
