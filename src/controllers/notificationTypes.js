// Imports: local files.
const { NotificationType, User } = require('../models');
const { ApiError } = require('../utils/classes');
const { firebase } = require('../utils/functions');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');

/**
 * @description Get all notification types.
 * @route       GET /api/notification_types.
 * @access      Private, only roles: [ADMIN].
 */
const getAll = asyncHandler(async (request, response, next) => {
  const { page, limit, pagination } = request.query;

  const options = { page, limit, pagination, sort: '-_id' };
  const query = { isDeleted: false };

  const notificationTypes = await NotificationType.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { notificationTypes }, error: null });
  return;
});

/**
 * @description Get one notification type.
 * @route       GET /api/notification_types/:notificationTypeId.
 * @access      Private, only roles: [ADMIN].
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { notificationTypeId } = request.params;

  const notificationType = await NotificationType.findOne({ _id: notificationTypeId, isDeleted: false });
  if (!notificationType) {
    next(new ApiError('Notification Type with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { notificationType }, error: null });
  return;
});

/**
 * @description Subscribe to one notification type.
 * @route       POST /api/notification_types/subscribe.
 * @access      Private, only roles: [USER].
 */
const subscribe = asyncHandler(async (request, response, next) => {
  const { _id: userId, fcmToken, notificationTypes } = request.user;
  const { type } = request.body;

  const notificationType = await NotificationType.findOne({ name: type, isDeleted: false });
  if (!notificationType) {
    next(new ApiError('Notification with given type not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (notificationTypes.includes(String(notificationType._id))) {
    next(new ApiError('Already subscribed to this topic!', httpCodes.BAD_REQUEST));
    return;
  }

  const updateUserPayload = { $addToSet: { notificationTypes: notificationType._id } };
  const updatedUser = await User.findByIdAndUpdate(userId, updateUserPayload, { new: true });
  if (!updatedUser) {
    next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const firebaseAdmin = firebase.initAdmin();
  await firebaseAdmin.messaging().subscribeToTopic(fcmToken, type);

  response.status(httpCodes.OK).json({ success: true, data: { subscribed: true }, error: null });
  return;
});

/**
 * @description Unsubscribe from one notification type.
 * @route       POST /api/notification_types/unsubscribe.
 * @access      Private, only roles: [USER].
 */
const unsubscribe = asyncHandler(async (request, response, next) => {
  const { _id: userId, fcmToken, notificationTypes } = request.user;
  const { type } = request.body;

  const notificationType = await NotificationType.findOne({ name: type, isDeleted: false });
  if (!notificationType) {
    next(new ApiError('Notification with given type not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (!notificationTypes.includes(String(notificationType._id))) {
    next(new ApiError('Cant unsubscribe from a topic you`re not subscribed to!', httpCodes.BAD_REQUEST));
    return;
  }

  const updateUserPayload = { $pull: { notificationTypes: notificationType._id } };
  const updatedUser = await User.findByIdAndUpdate(userId, updateUserPayload, { new: true });
  if (!updatedUser) {
    next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const firebaseAdmin = firebase.initAdmin();
  await firebaseAdmin.messaging().unsubscribeFromTopic(fcmToken, type);

  response.status(httpCodes.OK).json({ success: true, data: { unsubscribed: true }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, subscribe, unsubscribe };
