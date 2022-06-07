// Imports: third-party packages.
const { getAuth } = require('firebase-admin/auth');

// Imports: local files.
const { Admin, User } = require('../models');
const { ApiError } = require('../utils/classes');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');
const { jwt } = require('../utils/functions');

/**
 * @description Authenticate an user .
 * @route       POST /api/auth.
 * @access      Public.
 */
const authenticate = asyncHandler(async (request, response, next) => {
  const { name, surname, token } = request.body;

  const decodedToken = await getAuth().verifyIdToken(token);
  if (!decodedToken) {
    next(new ApiError('Unauthorized to access!', httpCodes.UNAUTHORIZED));
    return;
  }

  const uid = decodedToken.user_id;
  const providerId = decodedToken.firebase.sign_in_provider;

  const firebaseUser = await getAuth().getUser(uid);
  if (!firebaseUser) {
    next(new ApiError('User is not registred in firebase!', httpCodes.BAD_REQUEST));
    return;
  }

  const allowedProviders = ['password', 'google.com', 'facebook.com'];
  if (!allowedProviders.includes(providerId)) {
    next(new ApiError('Not allowed provider', httpCodes.UNAUTHORIZED));
    return;
  }

  const user = await User.findOne({ firebaseUid: uid, isDeleted: false });
  if (user) {
    response.status(httpCodes.OK).json({ success: true, data: { token }, error: null });
    return;
  }

  const payload = { name, surname, email: firebaseUser.email, firebaseUid: firebaseUser.uid, providerId };
  const createdUser = await User.create(payload);
  if (!createdUser) {
    next(new ApiError('Failed to create user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { token }, error: null });
  return;
});

/**
 * @description Update.
 * @route       PUT /api/auth/update.
 * @access      Public.
 */
const update = asyncHandler(async (request, response, next) => {
  const userId = request.user._id;
  const {
    name,
    surname,
    email,
    age,
    gender,
    weather,
    aqi,
    isPregnant,
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
    next(new ApiError('User not found in firebase!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    surname,
    email,
    age,
    gender,
    weather,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    hasChildren,
    hasChildrenDisease,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };
  const editedUser = await User.findOneAndUpdate({ _id: user._id }, { $set: payload }, { new: true });
  if (!editedUser) {
    next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const updatedFirebaseUser = await getAuth().updateUser(firebaseUser.uid, {
    email,
    displayName: `${name} ${surname}`,
  });
  if (!updatedFirebaseUser) {
    next(new ApiError('Failed to update user in Firebase!', httpCodes.BAD_REQUEST));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { user: editedUser }, error: null });
  return;
});

/**
 * @description Admin login.
 * @route       POST /api/auth/admin/login.
 * @access      Public.
 */
const adminLogin = asyncHandler(async (request, response, next) => {
  const { email, password, remember } = request.body;

  const admin = await Admin.findOne({ email, isDeleted: false }).select('_id email password');
  if (!admin) {
    next(new ApiError('Invalid Credentials!', httpCodes.UNAUTHORIZED));
    return;
  }

  const samePassword = await Admin.comparePasswords(password, admin.password);
  if (!samePassword) {
    next(new ApiError('Invalid Credentials!', httpCodes.UNAUTHORIZED));
    return;
  }

  const jwtResult = await jwt.sign({
    id: admin._id,
    email: admin.email,
    remember: remember,
  });
  if (!jwtResult.success) {
    next(new ApiError(jwtResult.error, httpCodes.INTERNAL_ERROR));
    return;
  }

  const { encoded } = jwtResult.data;
  response.status(httpCodes.CREATED).json({ success: true, data: { token: encoded }, error: null });
});

/**
 * @description Get current logged in user
 * @route       POST /api/auth/getMe.
 * @access      Private.
 */
const getMe = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;

  const user = await User.findById(userId);

  if (!user) {
    next(new ApiError('User is not registred in database!', httpCodes.NOT_FOUND));
    return;
  }

  const firebaseUser = await getAuth().getUser(user.firebaseUid);

  if (!firebaseUser) {
    next(new ApiError('User is not registred in firebase!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { user }, error: null });
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
module.exports = { authenticate, update, adminLogin, forgot, reset, getMe };
