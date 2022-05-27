// Imports: local files.
const { Admin } = require('../models');
const { ApiError } = require('../utils/classes');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');
const { jwt } = require('../utils/functions');

/**
 * @description Sign up.
 * @route       POST /api/auth/signup.
 * @access      Public.
 */
const signup = asyncHandler(async (request, response, next) => {
  response.status(httpCodes.CREATED).json({ message: 'Signup success!' });
});

/**
 * @description Login.
 * @route       POST /api/auth/admin/login.
 * @access      Public.
 */
const login = asyncHandler(async (request, response, next) => {
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
module.exports = { login };
