// Imports: core node modules.
const path = require('path');

// Imports: third-party packages.
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Imports: local files.
//const { authRouter } = require('./routes');
const { errorHandler } = require('./middlewares');
const {
  authRouter,
  recommendationRouter,
  recommendationCardRouter,
  advertisementsRouter,
  usersRouter,
} = require('./routes');

// Use general middleware.
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(fileUpload());

console.log('api run');

app.use('/api/auth', authRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/recommendationcards', recommendationCardRouter);
app.use('/api/advertisements', advertisementsRouter);
app.use('/api/users', usersRouter);

// Use error handling middleware.
app.use(errorHandler);

// Exports of this file.
module.exports = app;
