// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { notificationsController } = require('../controllers');
const { notificationsValidator } = require('../validations');
const { httpVerbs } = require('../configs');
const { validate } = require('../utils/functions');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [authorizeAdmin, validate(notificationsValidator.getAll), notificationsController.getAll],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorizeAdmin, validate(notificationsValidator.create), notificationsController.create],
  },
  {
    path: '/:notificationId',
    method: httpVerbs.GET,
    middlewares: [authorizeAdmin, validate(notificationsValidator.getOne), notificationsController.getOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
