// Imports: core node modules.
const path = require('path');

// Imports: third-party packages.
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();

// Imports: local files.
const { authRouter } = require('./routes');
const { errorHandler } = require('./middlewares');
const couponRoutes = require('./routes/coupons');
const companyRoutes = require('./routes/companies');

// Use general middleware.
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(fileUpload());

// Mount routers accordingly.
app.use('/api/auth', authRouter);
app.use('/api/coupons', couponRoutes);
app.use('/api/companies', companyRoutes);

// Use error handling middleware.
app.use(errorHandler);

// Exports of this file.
module.exports = app;
