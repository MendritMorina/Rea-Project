// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { authController } = require('../controllers');
const { authValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorize } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authController.authenticate],
  },
  {
    path: '/getMe',
    method: httpVerbs.GET,
    middlewares: [authorize, authController.getMe],
  },
  {
    path: '/update',
    method: httpVerbs.PUT,
    middlewares: [authController.update],
  },
  {
    path: '/forgot',
    method: httpVerbs.POST,
    middlewares: [validate(authValidator.forgot), authController.forgot],
  },
  {
    path: '/reset',
    method: httpVerbs.POST,
    middlewares: [validate(authValidator.reset), authController.reset],
  },
  {
    path: '/admin/login',
    method: httpVerbs.POST,
    middlewares: [validate(authValidator.adminLogin), authController.adminLogin],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
