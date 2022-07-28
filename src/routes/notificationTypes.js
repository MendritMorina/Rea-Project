// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { notificationTypesController } = require('../controllers');
const { notificationTypesValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize, authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [validate(notificationTypesValidator.getAll), notificationTypesController.getAll],
  },
  {
    path: '/:notificationTypeId',
    method: httpVerbs.GET,
    middlewares: [validate(notificationTypesValidator.getOne), notificationTypesController.getOne],
  },
  {
    path: '/subscribe',
    method: httpVerbs.POST,
    middlewares: [authorize, validate(notificationTypesValidator.subscribe), notificationTypesController.subscribe],
  },
  {
    path: '/unsubscribe',
    method: httpVerbs.POST,
    middlewares: [authorize, validate(notificationTypesValidator.unsubscribe), notificationTypesController.unsubscribe],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
