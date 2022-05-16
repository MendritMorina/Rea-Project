// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { userController } = require('../controllers');
//const { userValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');

// Define routes here.
const routes = [
  {
    path: '/',
    method: httpVerbs.GET,
    middlewares: [userController.getAll],
  },
  {
    path: '/:userId',
    method: httpVerbs.GET,
    middlewares: [userController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [userController.create],
  },
  {
    path: '/:userId',
    method: httpVerbs.PUT,
    middlewares: [userController.updateOne],
  },
  {
    path: '/:userId',
    method: httpVerbs.DELETE,
    middlewares: [userController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) router.route(route.path)[route.method](route.middlewares);

// Exports of this file.
module.exports = router;
