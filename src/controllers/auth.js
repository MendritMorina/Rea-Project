// Imports: local files.
const { User } = require('../models');
const { ApiError } = require('../utils/classes');
const { asyncHandler } = require('../middlewares');
const { httpCodes } = require('../configs');

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
 * @route       POST /api/auth/login.
 * @access      Public.
 */
const login = asyncHandler(async (request, response, next) => {
  response.status(httpCodes.OK).json({ message: 'Login success!' });
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
module.exports = { signup, login, forgot, reset };
