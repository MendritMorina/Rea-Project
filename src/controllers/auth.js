// Imports: local files.
const { User } = require('../models');
const { ApiError } = require('../utils/classes');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { response } = require('express');

// providerId = [ facebook.com, google.com, password ];

/**
 * @description Sign up.
 * @route       POST /api/auth/signup.
 * @access      Public.
 */
const signup = asyncHandler(async (request, response, next) => {
  const { providerId, uid } = request.body;

  const firebaseUser = await getAuth().getUser(uid);

  if (!firebaseUser) {
    next(new ApiError('User is not registred in firebase!', httpCodes.BAD_REQUEST));
    return;
  }

  const user = await User.findOne({ firebaseUid: uid, isDeleted: false });

  if (user) {
    next(new ApiError('User already exists in database!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    email: firebaseUser.email,
    firebaseUid: firebaseUser.uid, // uid
  };

  const createdUser = await User.create(payload);

  if (!createdUser) {
    next(new ApiError('User failed to create!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { firebaseUser, createdUser }, error: null });
});

/**
 * @description Login.
 * @route       POST /api/auth/login.
 * @access      Public.
 */
const login = asyncHandler(async (request, response, next) => {
  const { providerId, token } = request.body;

  const decodedToken = await getAuth().verifyIdToken(token);

  if (!decodedToken) {
    next(new ApiError('Unauthorized to access', httpCodes.UNAUTHORIZED));
    return;
  }

  const uid = decodedToken.uid;

  const firebaseUser = await getAuth().getUser(uid);

  if (!firebaseUser) {
    next(new ApiError('There is no user in firebase!', httpCodes.NOT_FOUND));
    return;
  }

  const user = await User.findOne({ firebaseUid: uid, isDeleted: false });

  if (!user) {
    next(new ApiError('User not found in database!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { token }, error: null });
});

/**
 * @description Update.
 * @route       PUT /api/auth/update.
 * @access      Public.
 */
const update = asyncHandler(async (request, response, next) => {
  const theUserId = '625e6c53419131c236181826';
  //const { userId } = '625e6c53419131c236181826';
  const userId = request.user._id;
  const {
    name,
    surname,
    email,
    password,
    age,
    gender,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
  } = request.body;

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    next(new ApiError('User not found!', httpCodes.NOT_FOUND));
    return;
  }

  const firebaseUser = await getAuth().getUser(user.firebaseUid);

  if (!firebaseUser) {
    next(new ApiError('User is not registred in firebase!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== user.name) {
    const userExists = (await User.countDocuments({ _id: { $ne: user._id }, name, isDeleted: false })) > 0;
    if (userExists) {
      next(new ApiError('User with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    surname,
    email,
    password,
    age,
    gender,
    weather,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    hasChildren,
    hasChildrenDisease,
    lastEditBy: theUserId,
    lastEditAt: new Date(Date.now()),
  };
  const editedUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedUser) {
    next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const updatedFireBaseUser = await getAuth().updateUser(firebaseUser.uid, {
    email,
    password,
    displayName: `${name} ${surname}`,
  });

  if (!updatedFireBaseUser) {
    next(new ApiError('Failed to update FireBase User!', httpCodes.BAD_REQUEST));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { editedUser, updatedFireBaseUser }, error: null });
});

/**
 * @description Forgot password.
 * @route       POST /api/auth/forgot.
 * @access      Public.
 */
const forgot = asyncHandler(async (request, response, next) => {
  response.status(httpCodes.OK).json({ message: 'Forgot success!' });
});

/**
 * @description Reset password.
 * @route       POST /api/auth/reset.
 * @access      Public.
 */
const reset = asyncHandler(async (request, response, next) => {
  response.status(httpCodes.OK).json({ message: 'Reset success!' });
});

// Exports of this file.
module.exports = { signup, login, update, forgot, reset };
