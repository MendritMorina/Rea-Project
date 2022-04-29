// Imports: local files.
const { Coupon } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all coupons.
 * @route       GET /api/coupons.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response, next) => {});

/**
 * @description Get coupon by id.
 * @route       GET /api/coupons/:couponId.
 * @access      Public.
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
 * @description Create a coupon.
 * @route       POST /api/coupons.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { discount, expirationDate } = request.body;
  //const recommendationExists = (await Recommendation.countDocuments({ name, isDeleted: false })) > 0;
  //if (recommendationExists) {
  //  next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
  //  return;
  //}

  const payload = {
    discount,
    expirationDate,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const coupon = await Coupon.create(payload);
  if (!coupon) {
    next(new ApiError('Failed to create new coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { coupon }, error: null });
});

/**
 * @description Update a coupon.
 * @route       PUT /api/coupons/:couponId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { couponId } = request.params;
  const { discount, expirationDate } = request.body;

  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  //if (name !== recommendation.name) {
  //  const recommendationExists =
  //    (await Recommendation.countDocuments({ _id: { $ne: id }, name, isDeleted: false })) > 0;
  //  if (recommendationExists) {
  //    next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
  //    return;
  //  }
  //}

  const payload = {
    discount,
    expirationDate,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };
  const editedCoupon = await Coupon.findOneAndUpdate(
    { _id: coupon._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedCoupon) {
    next(new ApiError('Failed to update recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon: editedCoupon }, error: null });
});

/**
 * @description Delete a coupon.
 * @route       DELETE /api/coupons/:couponId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { couponId } = request.params;
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedCoupon = await Coupon.findOneAndUpdate(
    { _id: coupon._id },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedCoupon) {
    next(new ApiError('Failed to delete coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon: deletedCoupon }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };
