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
    publicProdUrl: process.env.PUBLIC_PROD_URL,
    publicDevUrl: process.env.PUBLIC_DEV_URL,
    appIbi: process.env.APP_IBI,
    appSubSecret: process.env.APP_SUB_SECRET,
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
    publicProdUrl: process.env.PUBLIC_PROD_URL,
    publicDevUrl: process.env.PUBLIC_DEV_URL,
    appIbi: process.env.APP_IBI,
    appSubSecret: process.env.APP_SUB_SECRET,
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
    publicProdUrl: process.env.PUBLIC_PROD_URL,
    publicDevUrl: process.env.PUBLIC_DEV_URL,
    appIbi: process.env.APP_IBI,
    appSubSecret: process.env.APP_SUB_SECRET,
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
    'PUBLIC_PROD_URL',
    'PUBLIC_DEV_URL',
    'APP_IBI',
    'APP_SUB_SECRET',
  ],
};

// Exports of this file.
module.exports = config;
