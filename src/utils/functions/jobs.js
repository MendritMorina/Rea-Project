// Imports: third-party packages.
const schedule = require('node-schedule');
const axios = require('axios');
const appleReceiptVerify = require('node-apple-receipt-verify');

// Imports: local files.
const env = require('./env');
const { AQI, Cronjob, User, Subscription, SubscriptionType } = require('../../models');
const { subscriptions } = require('../../configs');

const getAQI = async () => {
  try {
    const aqi = await axios.get('https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=0');
    const aqiData = aqi.data;

    for (let i = 0; i < aqiData.length; i++) {
      if (!aqiData[i]) continue;

      const { localtime, x, y, pm10, pm25, no2, so2, o3, index, name } = aqiData[i];
      const geometry = { type: 'Point', coordinates: [x, y] };
      const geoJSON = { localtime, location: { ...geometry }, pm10, pm25, no2, so2, o3, index, name };

      await AQI.create(geoJSON);
    }

    //---------------------------------
    // function getDistanceFromLatLonInKm(latitude, longitude, latitude1, longitude1) {
    //   const R = 6371; // Radius of the earth in km
    //   var dLat = deg2rad(latitude1 - latitude); // deg2rad below
    //   var dLon = deg2rad(longitude1 - longitude);
    //   var a =
    //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //     Math.cos(deg2rad(latitude)) * Math.cos(deg2rad(latitude1)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //   var d = R * c; // Distance in km
    //   return d;
    // }

    // //to radian
    // function deg2rad(deg) {
    //   return deg * (Math.PI / 180);
    // }

    // let veryFarFromLocation;

    // if (location > veryFarFromLocation) {
    //   next(new ApiError('', httpCodes.NOT_FOUND));
    //   return;
    // }
    //---------------------------------

    const before12hours = new Date(Date.now() - 1000 * 60 * 60 * 12);
    await AQI.deleteMany({ createdAt: { $lte: before12hours } });

    await Cronjob.create({
      type: 'GET_AQI',
      success: true,
      information: {},
    });
  } catch (error) {
    console.log(error);
    await Cronjob.create({
      type: 'GET_AQI',
      success: false,
      information: { error: error.message || 'Server Error' },
    });
  }
};

const checkSubscriptions = async () => {
  try {
    appleReceiptVerify.config({
      secret: env.getByKey('appSubSecret'),
      excludeOldTransactions: true,
      ignoreExpiredError: true,
      ignoreExpired: false,
      environment: ['sandbox', 'production'],
    });

    const usersPastSub = await User.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'currentSubscription',
          foreignField: '_id',
          as: 'currentSubscription',
        },
      },

      { $unwind: '$currentSubscription' },
      {
        $match: {
          'currentSubscription._id': { $ne: null },
          'currentSubscription.expirationDate': { $lte: new Date(Date.now()) },
        },
      },
    ]);

    for (const user of usersPastSub) {
      const { receipt, productId, transactionId, originalTransactionId, expirationDate, purchaseDate } =
        user.currentSubscription;
      if (!receipt) continue;

      try {
        const products = await appleReceiptVerify.validate({ receipt: receipt });
        const latestProduct = products.sort((a, b) => Number(b.transactionId) - Number(a.transactionId))[0];
        if (!latestProduct) continue;

        if (
          latestProduct.originalTransactionId === originalTransactionId &&
          new Date(latestProduct.purchaseDate).getTime() >= new Date(expirationDate).getTime()
        ) {
          const subType = subscriptions[latestProduct.productId];
          const subscriptionType = await SubscriptionType.findOne({ name: subType.name });
          if (!subscriptionType) {
            await Cronjob.create({
              type: 'CHECK_SUBSCRIPTIONS',
              success: false,
              information: {
                error: 'Subscription type not found!',
                ranAt: new Date(Date.now()),
              },
            });
            continue;
          }

          const newSubscription = await Subscription.create({
            type: subscriptionType._id,
            user: user._id,
            productId: latestProduct.productId,
            transactionId: latestProduct.transactionId,
            originalTransactionId: latestProduct.originalTransactionId,
            purchaseDate: latestProduct.purchaseDate,
            expirationDate: latestProduct.expirationDate,
            receipt: receipt,
          });

          const updatePayload = {
            $set: {
              currentSubscription: newSubscription._id,
              lastEditBy: user._id,
              lastEditAt: new Date(Date.now()).toISOString(),
            },
            $push: {
              subscriptionsHistory: newSubscription._id,
            },
          };

          const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload, { new: true });
          if (!updatedUser) {
            await Cronjob.create({
              type: 'CHECK_SUBSCRIPTIONS',
              success: false,
              information: {
                error: 'Failed to update user',
                userId: user._id,
                ranAt: new Date(Date.now()),
              },
            });
            continue;
          }
        } else {
          const updatedSubscription = await Subscription.findByIdAndUpdate(
            user.currentSubscription._id,
            {
              $set: {
                isActive: false,
                lastEditBy: user._id,
                lastEditAt: new Date(Date.now()).toISOString(),
                markedExpiredAt: new Date(Date.now()).toISOString(),
              },
            },
            { new: true }
          );
        }
      } catch (error) {
        await Cronjob.create({
          type: 'CHECK_SUBSCRIPTIONS',
          success: false,
          information: {
            error: error.message || 'Something failed in cronjob!',
            ranAt: new Date(Date.now()),
          },
        });
      }
    }

    await Cronjob.create({
      type: 'CHECK_SUBSCRIPTIONS',
      success: true,
      information: {
        error: null,
        ranAt: new Date(Date.now()),
      },
    });
  } catch (error) {
    await Cronjob.create({
      type: 'CHECK_SUBSCRIPTIONS',
      success: false,
      information: {
        error: error.message || 'Something failed in cronjob!',
        ranAt: new Date(Date.now()),
      },
    });
  }
};

// Function that is used to init all jobs.
const initJobs = () => {
  schedule.scheduleJob('0 * * * *', async () => {
    await getAQI();
  });

  schedule.scheduleJob('0 20 * * *', async function (fireDate) {
    await checkSubscriptions();
  });
};

// Exports of this file.
module.exports = initJobs;
