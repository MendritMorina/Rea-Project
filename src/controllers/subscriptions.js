// Third-party package imports.
const iap = require('iap');

// Local file imports.
const { User, Subscription, SubscriptionType } = require('../models');
const { ApiError } = require('../utils/classes');
const { env } = require('../utils/functions');
const { asyncHandler } = require('../middlewares');
const { httpCodes, subscriptions } = require('../configs');

/**
 * @description Create subscription for apple.
 * @route       POST /api/subscriptions/apple.
 * @access      Public.
 */
const createApple = asyncHandler(async (request, response, next) => {
  const { receipt, productId, originalTransactionId } = request.body;
  const { _id } = request.user;

  const user = await User.findById(_id).populate('currentSubscription').populate('subscriptionsHistory');
  if (!user) {
    next(new ApiError('User with given id was not found!', httpCodes.NOT_FOUND));
    return;
  }

  const otherSubscription = await Subscription.findOne({ user: { $ne: _id }, originalTransactionId, productId });
  if (otherSubscription) {
    const otherUser = await User.findOne({ _id: otherSubscription.user, isActive: true }).populate(
      'currentSubscription'
    );
    if (otherUser && otherUser.currentSubscription && otherUser.currentSubscription.isActive) {
      next(new ApiError('This subscription is already in use elsewhere!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  let updateUser = false;
  if (user.currentSubscription) {
    const subscriptionExpired = new Date(Date.now()) > new Date(user.currentSubscription.expirationDate);
    const userChangedSubscription = user.currentSubscription.productId !== productId;

    if (!(subscriptionExpired || userChangedSubscription)) {
      next(new ApiError('Already have a subscription!', httpCodes.BAD_REQUEST));
      return;
    }

    updateUser = true;
  }

  const platform = 'apple';
  const payment = {
    receipt: receipt,
    productId: productId,
    packageName: env.getByKey('appIbi'),
    secret: env.getByKey('appSubSecret'),
    excludeOldTransactions: true,
  };

  iap.verifyPayment(platform, payment, async function (error, iapResponse) {
    if (error) {
      next(new ApiError('Failed to verify receipt', httpCodes.BAD_REQUEST));
      return;
    }

    const { productId, transactionId, purchaseDate, expirationDate, pendingRenewalInfo, latestReceiptInfo } =
      iapResponse;

    const subType = subscriptions[productId];
    const subscriptionType = await SubscriptionType.findOne({ name: subType.name });
    if (!subscriptionType) {
      next(new ApiError('Subscription type with given name was not found!', httpCodes.NOT_FOUND));
      return;
    }

    const newSubscription = await Subscription.create({
      type: subscriptionType._id,
      user: user._id,
      productId: productId,
      transactionId: transactionId,
      originalTransactionId: latestReceiptInfo[0].original_transaction_id,
      purchaseDate: purchaseDate,
      expirationDate: expirationDate,
      receipt: receipt,
    });

    let updatePayload = {
      $set: {
        currentSubscription: newSubscription._id,
        subscriptionsHistory: [newSubscription._id],
        lastEditBy: user._id,
        lastEditAt: new Date(Date.now()).toISOString(),
      },
    };

    if (updateUser) {
      updatePayload = {
        $set: {
          currentSubscription: newSubscription._id,
          lastEditBy: user._id,
          lastEditAt: new Date(Date.now()).toISOString(),
        },
        $push: {
          subscriptionsHistory: newSubscription._id,
        },
      };
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload, { new: true });
    if (!updatedUser) {
      next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
      return;
    }

    response.status(httpCodes.CREATED).json({ success: true, data: { user: updatedUser }, error: null });
    return;
  });
});

/**
 * @description Restore subscription for apple.
 * @route       POST /api/subscriptions/apple/restore.
 * @access      Public.
 */
const restoreApple = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { originalTransactionId, productId, receipt } = request.body;

  const currentUser = await User.findOne({ _id: userId, isActive: true }).populate('currentSubscription');
  if (!currentUser) {
    next(new ApiError('User with given id was not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (
    (currentUser.currentSubscription && currentUser.currentSubscription.isActive) ||
    (currentUser.subscriptionsHistory && currentUser.subscriptionsHistory.length)
  ) {
    next(new ApiError('You are already subscribed or have subscribed in the past!', httpCodes.BAD_REQUEST));
    return;
  }

  const targetSubscription = await Subscription.findOne({ user: { $ne: userId }, originalTransactionId, productId });
  if (!targetSubscription) {
    next(new ApiError('Subscription with given transaction id was not found!', httpCodes.NOT_FOUND));
    return;
  }

  const oldUser = await User.findOne({ _id: targetSubscription.user, isActive: true }).populate('currentSubscription');
  if (!oldUser) {
    next(new ApiError('Your previous account was not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (
    !oldUser.currentSubscription ||
    !oldUser.currentSubscription.isActive ||
    oldUser.currentSubscription.originalTransactionId !== originalTransactionId
  ) {
    next(new ApiError('Old transaction is not active anymore or not found!', httpCodes.NOT_FOUND));
    return;
  }

  oldUser.currentSubscription = null;
  oldUser.subscriptionsHistory = [];
  await oldUser.save();

  const platform = 'apple';
  const payment = {
    receipt: receipt,
    productId: productId,
    packageName: env.getByKey('appIbi'),
    secret: env.getByKey('appSubSecret'),
    excludeOldTransactions: true,
  };

  iap.verifyPayment(platform, payment, async function (error, iapResponse) {
    if (error) {
      next(new ApiError('Failed to verify receipt!', httpCodes.BAD_REQUEST));
      return;
    }

    // const { productId, transactionId, purchaseDate, expirationDate, pendingRenewalInfo, latestReceiptInfo } =
    //   iapResponse;

    const subType = subscriptions[iapResponse.productId];
    const subscriptionType = await SubscriptionType.findOne({ name: subType.name });
    if (!subscriptionType) {
      next(new ApiError('Subscription type with given name was not found!', httpCodes.NOT_FOUND));
      return;
    }

    const newSubscription = await Subscription.create({
      type: subscriptionType._id,
      user: userId,
      productId: iapResponse.productId,
      transactionId: iapResponse.transactionId,
      originalTransactionId: iapResponse.latestReceiptInfo[0].original_transaction_id,
      purchaseDate: iapResponse.purchaseDate,
      expirationDate: iapResponse.expirationDate,
      receipt: receipt,
    });
    if (!newSubscription) {
      next(new ApiError('Failed to create new subscription!', httpCodes.INTERNAL_ERROR));
      return;
    }

    let updatePayload = {
      $set: {
        currentSubscription: newSubscription._id,
        subscriptionsHistory: [newSubscription._id],
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()).toISOString(),
      },
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, { new: true });
    if (!updatedUser) {
      next(new ApiError('Failed to update user!', httpCodes.INTERNAL_ERROR));
      return;
    }

    response.status(httpCodes.CREATED).json({ success: true, data: { user: updatedUser }, error: null });
    return;
  });
});

/**
 * @description Validate subscription.
 * @route       POST /api/subscriptions/me.
 * @access      Public.
 */
const me = asyncHandler(async (request, response, next) => {
  const { _id } = request.user;

  const user = await User.findOne({ _id, isDeleted: false }).populate('currentSubscription');
  if (!user) {
    next(new ApiError('User with given id was not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (!user.currentSubscription || !user.currentSubscription.isActive) {
    response.status(httpCodes.OK).json({ success: true, data: { subscribed: false } });
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { subscribed: true } });
  return;
});

// Exports of this file.
module.exports = { createApple, restoreApple, me };
