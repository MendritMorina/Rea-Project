// Imports: local files.
const { Notification, NotificationType } = require('../models');
const { ApiError } = require('../utils/classes');
const { firebase } = require('../utils/functions');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');

/**
 * @description Get all notifications.
 * @route       GET /api/notifications.
 * @access      Private, only roles: [ADMIN].
 */
const getAll = asyncHandler(async (request, response, next) => {
  const { page, limit, pagination } = request.query;

  const options = { page, limit, pagination, sort: '-_id', populate: 'type' };
  const query = { isDeleted: false };

  const notifications = await Notification.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { notifications }, error: null });
  return;
});

/**
 * @description Get one notification.
 * @route       GET /api/notifications/:notificationId.
 * @access      Private, only roles: [ADMIN].
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { notificationId } = request.params;

  const notification = await Notification.findOne({ _id: notificationId, isDeleted: false }).populate('type');
  if (!notification) {
    next(new ApiError('Notification with given id was not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { notification }, error: null });
  return;
});

/**
 * @description Create new notification.
 * @route       POST /api/notifications.
 * @access      Private, only roles: [ADMIN].
 */
const create = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { title, body, type } = request.body;

  const notificationType = await NotificationType.findOne({ name: type, isDeleted: false });
  if (!notificationType) {
    next(new ApiError('Notification Type with given name not found!', httpCodes.NOT_FOUND));
    return;
  }

  const notification = await Notification.create({ title, body, type: notificationType._id, createdBy: adminId });
  if (!notification) {
    next(new ApiError('Failed to create new notification!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const notificationData = { data: {}, notification: { title, body, sound: 'default' } };
  const notificationConfig = { priority: 'high', contentAvailable: true };

  const firebaseAdmin = firebase.initAdmin();
  await firebaseAdmin.messaging().sendToTopic(type, notificationData, notificationConfig);

  response.status(httpCodes.CREATED).json({ success: true, data: { notification }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create };
