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
  const { receipt, productId } = request.body;
  const { _id } = request.user;

  const user = await User.findById(_id).populate('currentSubscription').populate('subscriptionsHistory');
  if (!user) {
    next(new ApiError(messages.MSG_NOT_FOUND(userSingular, 'Id'), httpCodes.NOT_FOUND));
    return;
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
module.exports = { createApple, me };
