// Imports: third-party packages.
const { getAuth } = require('firebase-admin/auth');

// Imports: local files.
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const { httpCodes, constants } = require('../configs');
const { ApiError } = require('../utils/classes');

const authorize = asyncHandler(async (request, response, next) => {
  const { authorization } = request.headers;
  if (!authorization) {
    next(new ApiError('Missing auth header!', httpCodes.UNAUTHORIZED));
    return;
  }

  const [bearer, token] = authorization.split(' ');
  if (!bearer || bearer !== 'Bearer' || !token) {
    next(new ApiError('Wrong auth header!', httpCodes.UNAUTHORIZED));
    return;
  }

  let decodedToken = null;
  try {
    decodedToken = await getAuth().verifyIdToken(token);
    if (!decodedToken) {
      next(new ApiError(constants.TOKEN_EXPIRED, httpCodes.UNAUTHORIZED));
      return;
    }
  } catch (error) {
    next(new ApiError(constants.TOKEN_EXPIRED, httpCodes.UNAUTHORIZED));
    return;
  }

  const uid = decodedToken.uid;
  const emailVerfied = decodedToken.email_verified;

  const firebaseUser = await getAuth().getUser(uid);
  if (!firebaseUser) {
    next(new ApiError('Firebase user was not found!', httpCodes.UNAUTHORIZED));
    return;
  }

  const user = await User.findOne({ isDeleted: false, firebaseUid: uid });
  if (!user) {
    next(new ApiError('User is not registred in database!', httpCodes.UNAUTHORIZED));
    return;
  }

  if (user.email && !emailVerfied) {
    next(new ApiError('The email is not verified', httpCodes.UNAUTHORIZED));
    return;
  }

  request.user = user;
  next();
});

// Exports of this file.
module.exports = authorize;
