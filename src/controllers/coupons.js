// Imports: core node modules.

// Imports: third-party packages.

// Imports: local files.
const { Coupon } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all coupons.
 */
const getAll = asyncHandler(async (request, response, next) => {
  const coupons = await Coupon.find();

  response.status(200).json({ success: true, count: coupons.length, data: coupons });
});

/**
 * @description Get one coupon.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { couponId } = request.params;
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon }, error: null });
});

/**
 * @description Create new coupon.
 */
const create = asyncHandler(async (request, response, next) => {
  const { name, description, discount, expirationDate } = request.body;

  const couponExists = (await Coupon.countDocuments({ name, isDeleted: false })) > 0;
  if (couponExists) {
    next(new ApiError('Coupon with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    description,
    discount,
    expirationDate,
  };
  const coupon = await Coupon.create(payload);
  if (!coupon) {
    next(new ApiError('Failed to create new coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { coupon: updatedCoupon }, error: null });
});

/**
 * @description Update one coupon.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { couponId } = request.params;
  const { name, description, discount, expirationDate } = request.body;

  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    description,
    discount,
    expirationDate,
  };
  const editedCoupon = await Coupon.findOneAndUpdate(
    { _id: coupon._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedCoupon) {
    next(new ApiError('Failed to update coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { coupon: updatedCoupon }, error: null });
});

/**
 * @description Delete one coupon.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const { couponId } = request.params;
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (!deletedCoupon) {
    next(new ApiError('Failed to delete Coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon: deletedCoupon }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };
