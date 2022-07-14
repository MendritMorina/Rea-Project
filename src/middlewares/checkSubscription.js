// Imports: local files.
const asyncHandler = require('./asyncHandler');
const { User } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');

const checkSubscription = asyncHandler(async (request, response, next) => {
  if (request.user) {
    next(new ApiError('Unauthorized', httpCodes.UNAUTHORIZED));
    return;
  }

  const { _id: userId } = request.user;
  const user = await User.findOne({ _id: userId, isDeleted: false }).populate('currentSubscription');
  if (!user) {
    next(new ApiError('Unauthorized', httpCodes.UNAUTHORIZED));
    return;
  }

  const isSubscribed = user.currentSubscription && user.currentSubscription.isActive;
  if (!isSubscribed) {
    next(new ApiError('Not subscribed to access this feature!', httpCodes.FORBIDDEN));
    return;
  }

  next();
});

// Exports of this file.
module.exports = checkSubscription;
