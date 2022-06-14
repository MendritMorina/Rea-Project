// Imports: third-party packages.
const express = require('express');
const router = express.Router();

// Imports: local files.
const { storyController } = require('../controllers');
const { storyValidator } = require('../validations');
const { validate } = require('../utils/functions');
const { httpVerbs } = require('../configs');
const { authorizeAdmin } = require('../middlewares');

// Define routes here.
const routes = [
  {
    path: '/admin',
    method: httpVerbs.GET,
    middlewares: [validate(storyValidator.getAllStories), storyController.getAllAdmin],
  },
  {
    path: '/mobile',
    method: httpVerbs.GET,
    middlewares: [validate(storyValidator.getAllStories), storyController.getAllMobile],
  },
  {
    path: '/:storyId',
    method: httpVerbs.GET,
    middlewares: [validate(storyValidator.validateStoryId), storyController.getOne],
  },
  {
    path: '/',
    method: httpVerbs.POST,
    middlewares: [authorizeAdmin, validate(storyValidator.createStory), storyController.create],
  },
  {
    path: '/:storyId',
    method: httpVerbs.PUT,
    middlewares: [authorizeAdmin, validate(storyValidator.updateStory), storyController.updateOne],
  },
  {
    path: '/:storyId',
    method: httpVerbs.DELETE,
    middlewares: [authorizeAdmin, validate(storyValidator.validateStoryId), storyController.deleteOne],
  },
];

// Mount routes accordingly.
for (const route of routes) {
  router.route(route.path)[route.method](route.middlewares);
}

// Exports of this file.
module.exports = router;
