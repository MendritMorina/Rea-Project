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
  baseRecommendionRouter,
  informativeRecommendionRouter,
  recommendationCardRouter,
  advertisementsRouter,
  usersRouter,
  couponRouter,
  companyRouter,
  storyRouter,
  usedCouponRouter,
  aqiRouter,
  subscriptionsRouter,
  notificationsRouter,
  notificationTypesRouter,
} = require('./routes');

// Use general middleware.
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));
app.use(fileUpload());

app.use('/api/auth', authRouter);
app.use('/api/baserecommendations', baseRecommendionRouter);
app.use('/api/informativerecommendations', informativeRecommendionRouter);
app.use('/api/recommendationcards', recommendationCardRouter);
app.use('/api/advertisements', advertisementsRouter);
app.use('/api/users', usersRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/companies', companyRouter);
app.use('/api/stories', storyRouter);
app.use('/api/usedCoupons', usedCouponRouter);
app.use('/api/aqi', aqiRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/notification_types', notificationTypesRouter);

// Use error handling middleware.
app.use(errorHandler);

// Exports of this file.
module.exports = app;
