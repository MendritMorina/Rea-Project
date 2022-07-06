// Imports: third-party packages.
const mongoose = require('mongoose');
const { v4 } = require('uuid');
const axios = require('axios').default;

// Imports: local files.
const { UsedCoupon, Coupon } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all used coupons.
 * @route       GET /api/usedCoupons.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response, next) => {
  const { page, limit, pagination, type, company, user, isUsed, couponId } = request.query;
  const options = { page, limit, pagination };
  const query = { isDeleted: false };
  if (couponId) query['coupon._id'] = new mongoose.Types.ObjectId(couponId);
  if (type) query['coupon.type'] = type;
  if (company) query['company._id'] = new mongoose.Types.ObjectId(company);
  if (user) query['user._id'] = new mongoose.Types.ObjectId(user);
  if (isUsed === 1) query['isUsed'] = true;
  else if (isUsed === 0) query['isUsed'] = false;

  const usedCouponsAggregate = UsedCoupon.aggregate([
    {
      $lookup: {
        from: 'coupons',
        localField: 'coupon',
        foreignField: '_id',
        as: 'coupon',
      },
    },
    { $unwind: { path: '$coupon', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'companies',
        localField: 'company',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    {
      $match: query,
    },
    {
      $project: {
        isUsed: 1,
        usedAt: 1,
        'company.name': 1,
        'company.logo': 1,
        'company.email': 1,
        'company.number': 1,
        'coupon.discount': 1,
        'coupon.description': 1,
        'coupon.startDate': 1,
        'coupon.expirationDate': 1,
        'coupon.type': 1,
        'user.name': 1,
        'user.surname': 1,
        'user.email': 1,
        'user.gender': 1,
      },
    },
  ]);
  const usedCoupons = await UsedCoupon.aggregatePaginate(usedCouponsAggregate, options);
  response.status(httpCodes.OK).json({ success: true, data: { usedCoupons }, error: null });
  return;
});

/**
 * @description Get used coupon by code.
 * @route       GET /api/usedCoupons/:couponCode.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { couponCode } = request.params;
  const { userId } = request.query;

  const usedCoupon = await UsedCoupon.findOne({ couponCode, isDeleted: false })
    .populate('coupon')
    .populate('user')
    .populate('company');
  if (!usedCoupon) {
    next(new ApiError('Used Coupon with given code was not found!', httpCodes.NOT_FOUND));
    return;
  }

  const targetCoupon = await Coupon.findOne({ _id: usedCoupon.coupon._id, isDeleted: false });
  if (!targetCoupon) {
    next(new ApiError('Coupon not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (targetCoupon.type === 'singular') {
    const usedCoupon = await UsedCoupon.findOne({
      coupon: targetCoupon._id,
      user: userId,
      isUsed: true,
      isDeleted: false,
    })
      .populate('coupon')
      .populate('user')
      .populate('company');
    if (usedCoupon) {
      response.status(httpCodes.OK).json({ success: true, data: { usedCoupon }, error: null });
      return;
    }
  }

  response.status(httpCodes.OK).json({ success: true, data: { usedCoupon }, error: null });
  return;
});

/**
 * @description Get number of times a coupon was used.
 * @route       GET /api/usedCoupons/:couponId/number.
 * @access      Public.
 */
const getNumberOfUses = asyncHandler(async (request, response, next) => {
  const { couponId } = request.params;

  const number = await UsedCoupon.countDocuments({ _id: couponId, isDeleted: false, isUsed: true });

  response.status(httpCodes.OK).json({ success: true, data: { number }, error: null });
  return;
});

/**
 * @description Create an used coupon.
 * @route       POST /api/usedCoupons.
 * @access      Private, only users.
 */
const create = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { couponId } = request.body;

  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon with given id not found', httpCodes.NOT_FOUND));
    return;
  }

  const today = new Date(Date.now());
  const startDate = new Date(coupon.startDate);
  const expirationDate = new Date(coupon.expirationDate);

  if (!(today >= startDate && today <= expirationDate)) {
    next(new ApiError('Coupon already expired', httpCodes.BAD_REQUEST));
    return;
  }

  const usedCoupon = await UsedCoupon.create({
    user: userId,
    coupon: coupon._id,
    company: coupon.company,
    couponCode: v4(),
  });
  if (!usedCoupon) {
    next(new ApiError('Failed to use coupon', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { usedCoupon }, error: null });
  return;
});

/**
 * @description Use a coupon.
 * @route       POST /api/usedCoupons/use.
 * @access      Private, only users.
 */
const use = asyncHandler(async (request, response, next) => {
  const { couponId, couponCode, userId } = request.body;

  const coupon = await Coupon.findOne({ _id: couponId, isDeleted: false });
  if (!coupon) {
    next(new ApiError('Coupon with given id not found', httpCodes.NOT_FOUND));
    return;
  }

  const today = new Date(Date.now());
  const startDate = new Date(coupon.startDate);
  const expirationDate = new Date(coupon.expirationDate);

  if (!(today >= startDate && today <= expirationDate)) {
    next(new ApiError('Coupon already expired', httpCodes.BAD_REQUEST));
    return;
  }

  const usedNumber = await UsedCoupon.countDocuments({
    user: userId,
    coupon: coupon._id,
    isUsed: true,
    isDeleted: false,
  });
  if (coupon.type === 'singular' && usedNumber === 1) {
    next(new ApiError('Coupon already used', httpCodes.BAD_REQUEST));
    return;
  }

  const usedCoupon = await UsedCoupon.findOne({ couponCode, isDeleted: false }).populate('coupon').populate('user');
  if (!usedCoupon) {
    next(new ApiError('Coupon with given code not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (usedCoupon.isUsed) {
    next(new ApiError('Already used this coupon!', httpCodes.BAD_REQUEST));
    return;
  }

  const updatedUsedCoupon = await UsedCoupon.findByIdAndUpdate(
    usedCoupon._id,
    { $set: { isUsed: true, usedAt: new Date(Date.now()) } },
    { new: true }
  );
  if (!updatedUsedCoupon) {
    next(new ApiError('Failed to use coupon!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { used: true }, error: null });
  return;
});

module.exports = { getAll, getOne, getNumberOfUses, create, use };
