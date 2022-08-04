// Imports: third-party packages.
const { getAuth } = require('firebase-admin/auth');

// Imports: local files.
const { Admin, User } = require('../models');
const { ApiError } = require('../utils/classes');
const { asyncHandler } = require('../middlewares');
const { httpCodes, staticValues, constants } = require('../configs');
const { jwt, checkValidValues, firebase, mailchimp } = require('../utils/functions');

/**
 * @description Authenticate an user .
 * @route       POST /api/auth.
 * @access      Public.
 */
const authenticate = asyncHandler(async (request, response, next) => {
  const { name, surname, fcmToken } = request.body;
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
    if (user.fcmToken !== fcmToken) {
      const updatePayload = { $set: { fcmToken } };
      const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload).populate('notificationTypes');
      if (!updatedUser) {
        next(new ApiError('Failed to add token to user!', httpCodes.INTERNAL_ERROR));
        return;
      }

      const firebaseAdmin = firebase.initAdmin();

      for (const type of updatedUser.notificationTypes) {
        if (user.fcmToken) await firebaseAdmin.messaging().unsubscribeFromTopic(user.fcmToken, type.name);
        await firebaseAdmin.messaging().subscribeToTopic(fcmToken, type.name);
      }
    }

    response.status(httpCodes.OK).json({ success: true, data: { token }, error: null });
    return;
  }

  // const emailExists = (await User.countDocuments({ email: firebaseUser.email, isDeleted: false })) > 0;
  // if (emailExists) {
  //   next(new ApiError('Given email already exists!', httpCodes.INTERNAL_ERROR));
  //   return;
  // }

  const payload = { name, surname, email: firebaseUser.email, firebaseUid: firebaseUser.uid, providerId, fcmToken };
  const createdUser = await User.create(payload);
  if (!createdUser) {
    next(new ApiError('Failed to create user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const currentMode = process.env.NODE_ENV;
  const currentAudience = mailchimp.getInitialAudiences()[currentMode];

  const mailchimpUser = { email: createdUser.email, firstName: name || 'NA', lastName: surname || 'NA' };
  const mailchimpResult = await mailchimp.createContact(mailchimpUser, currentAudience);
  // if (!mailchimpResult.success) {
  //   next(new ApiError(mailchimpResult.error, mailchimpResult.code));
  //   return;
  // }

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

  if (age && !staticValues.age.includes(age)) {
    next(new ApiError(`The value of ${age} is not in allowed values : ${staticValues.age} !`, httpCodes.BAD_REQUEST));
    return;
  }

  if (gender && !staticValues.gender.includes(gender)) {
    next(
      new ApiError(`The value of ${gender} is not in allowed values : ${staticValues.gender} !`, httpCodes.BAD_REQUEST)
    );
    return;
  }

  if (isPregnant && gender !== 'Femër') {
    next(new ApiError('You cannot create a user where is pregnant and is not female!', httpCodes.BAD_REQUEST));
    return;
  }

  if (!hasChildren && hasChildrenDisease && hasChildrenDisease.length > 0) {
    next(
      new ApiError('You cannot create a user where it has children disease and has no children!', httpCodes.BAD_REQUEST)
    );
    return;
  }

  const types = ['haveDiseaseDiagnosis', 'energySource', 'hasChildrenDisease'];

  for (const type of types) {
    if (request.body[type]) {
      const result = checkValidValues(type, request.body[type]);
      if (result && result.error) {
        next(new ApiError(result.error, result.code));
        return;
      }
    }
  }

  const payload = {
    name,
    surname,
    email,
    age,
    gender,
    isPregnant,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    hasChildren,
    hasChildrenDisease,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };

  if (user.email !== email) {
    const emailExists = (await User.countDocuments({ _id: { $ne: user._id }, email: email, isDeleted: false })) > 0;
    if (emailExists) {
      next(new ApiError('This email is already registered in our app!', httpCodes.BAD_REQUEST));
      return;
    }
  }

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

  const user = await User.findOne({ _id: userId, isDeleted: false });
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
