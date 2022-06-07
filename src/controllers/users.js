// Imports: third-party packagaes.
const { getAuth } = require('firebase-admin/auth');

// Imports: local files.
const { User } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');
const { httpCodes } = require('../configs');

/**
 * @description Get all users.
 * @route       GET /api/users.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination, select, sort } = request.query; // TODO: validator missing, this doesnt work!

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
    select: select ? filterValues(select, []) : 'name surname',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'currentSubscription',
  };

  const query = { isDeleted: false };
  const users = await User.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { users }, error: null });
  return;
});

/**
 * @description Get user by id.
 * @route       GET /api/users/:userId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { userId } = request.params;

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

  response.status(httpCodes.OK).json({ success: true, data: { user, firebaseUser }, error: null });
  return;
});

// @desc  Get current logged in user
// @route POST /api/v1/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
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

  res.status(200).json({ success: true, data: user });
});

/**
 * @description Update a user.
 * @route       PUT /api/users/:userId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { userId } = request.params;
  const {
    name,
    surname,
    email,
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
    displayName: `${name} ${surname}`,
  });

  response.status(httpCodes.OK).json({ success: true, data: { editedUser, updatedFireBaseUser }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, updateOne };
