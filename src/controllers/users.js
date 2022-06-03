const User = require('../models/User');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');

const { httpCodes } = require('../configs');

const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

/**
 * @description Get all users.
 * @route       GET /api/users.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select ? filterValues(select, []) : 'name surname',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'currentSubscription',
  };

  const query = {
    isDeleted: false,
  };

  const users = await User.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { users }, error: null });
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
});

/**
 * @description Create a user.
 * @route       POST /api/users.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
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

  const userExists = (await User.countDocuments({ name, isDeleted: false })) > 0;
  if (userExists) {
    next(new ApiError('User with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const firebaseUser = await getAuth().createUser({
    email,
    password,
    displayName: `${name} ${surname}`,
    //disabled: false,
  });

  if (!firebaseUser) {
    next(new ApiError('Failed to create the firebase User!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const payload = {
    name,
    surname,
    email,
    password,
    firebaseUid: firebaseUser.uid,
    age,
    gender,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    currentSubscription: null,
    pastSubscriptions: [],
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const user = await User.create(payload);
  if (!user) {
    next(new ApiError('Failed to create new user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { firebaseUser, user }, error: null });
});

/**
 * @description Update a user.
 * @route       PUT /api/users/:userId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const theUserId = '625e6c53419131c236181826';
  const { userId } = request.params;
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

  response.status(httpCodes.OK).json({ success: true, data: { editedUser, updatedFireBaseUser }, error: null });
});

/**
 * @description Delete a user.
 * @route       DELETE /api/users/:userId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const theUserId = '625e6c53419131c236181826';
  const { userId } = request.params;

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    next(new ApiError('User not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        isDeleted: true,
        lastEditBy: theUserId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedUser) {
    next(new ApiError('Failed to delete user!', httpCodes.INTERNAL_ERROR));
    return;
  }

  getAuth()
    .deleteUser(user.firebaseUid)
    .then(() => {
      console.log('Deletion was successful');
    })
    .catch((err) => {
      next(new ApiError('Failed to delete user!' + err.name, httpCodes.INTERNAL_ERROR));
      return;
    });

  response.status(httpCodes.OK).json({ success: true, data: { deletedUser }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
