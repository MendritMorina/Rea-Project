// Imports: third-party packages.
const { v4 } = require('uuid');

// Imports: local files.
const { UsedCoupon, Coupon } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Use a specific coupon.
 * @route       POST /api/usedCoupons.
 * @access      Private, only users.
 */
const create = asyncHandler(async (request, response, next) => {
  const { user, coupon } = request.body;

  const dbCoupon = await Coupon.findOne({ _id: coupon, isDeleted: false });
  if (!dbCoupon) {
    next(new ApiError('Coupon with given id not found', httpCodes.UNAUTHORIZED));
    return;
  }

  const today = new Date(Date.now());
  const startDate = new Date(dbCoupon.startDate);
  const expirationDate = new Date(dbCoupon.expirationDate);

  if (!(today >= startDate && today <= expirationDate)) {
    next(new ApiError('Coupon already expired', httpCodes.UNAUTHORIZED));
    return;
  }

  const usedNumber = await UsedCoupon.countDocuments({ user: user, coupon: dbCoupon._id });
  if (dbCoupon.type === 'singular' && usedNumber === 1) {
    next(new ApiError('Coupon already used', httpCodes.BAD_REQUEST));
    return;
  }

  const usedCoupon = await UsedCoupon.create({ user: user, coupon: coupon, couponCode: v4() });
  if (!usedCoupon) {
    next(new ApiError('Failed to use coupon', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { usedCoupon }, error: null });
  return;
});

const update = asyncHandler(async (request, response, next) => {});

module.exports = { create };
