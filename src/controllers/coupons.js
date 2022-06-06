// Imports: local files.
const { Coupon } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all coupons.
 * @route       GET /api/coupons.
 * @access      Public
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
    populate: 'company',
  };

  const query = { isDeleted: false };

  const coupons = await Coupon.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { coupons }, error: null });
  return;
});

/**
 * @description Get coupon by id.
 * @route       GET /api/coupons/:couponId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { couponId } = request.params;
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false }).populate('company');
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon }, error: null });
  return;
});

/**
 * @description Create a coupon.
 * @route       POST /api/coupons.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { discount, description, startDate, expirationDate, type, company } = request.body;

  const payload = {
    discount,
    description,
    startDate,
    expirationDate,
    type,
    company,
    createdBy: adminId,
    createdAt: new Date(Date.now()),
  };

  const coupon = await Coupon.create(payload);
  if (!coupon) {
    next(new ApiError('Failed to create new coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { coupon }, error: null });
  return;
});

/**
 * @description Update a coupon.
 * @route       PUT /api/coupons/:couponId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { couponId } = request.params;
  const { discount, description, startDate, expirationDate, type, company } = request.body;

  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    discount,
    description,
    startDate,
    expirationDate,
    type,
    company,
    updatedBy: adminId,
    updatedAt: new Date(Date.now()),
  };
  const editedCoupon = await Coupon.findOneAndUpdate({ _id: coupon._id }, { $set: payload }, { new: true });
  if (!editedCoupon) {
    next(new ApiError('Failed to update coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon: editedCoupon }, error: null });
  return;
});

/**
 * @description Delete a coupon.
 * @route       DELETE /api/coupons/:couponId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { couponId } = request.params;
  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedCoupon = await Coupon.findOneAndUpdate(
    { _id: coupon._id },
    {
      $set: {
        isDeleted: true,
        updatedBy: adminId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedCoupon) {
    next(new ApiError('Failed to delete coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { coupon: deletedCoupon }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };
