// Imports: third-party packages.
const express = require('express');
const cors = require('cors');
const app = express();
// Imports: local files.
const { authRouter } = require('./routes');
const { errorHandler } = require('./middlewares');
const { couponRouter, companyRouter } = require('./routes');

// Use general middleware.
app.use(express.json());
app.use(cors());

// Mount routers accordingly.
app.use('/api/auth', authRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/companies', companyRouter);

// Use error handling middleware.
app.use(errorHandler);

// Exports of this file.
module.exports = app;
