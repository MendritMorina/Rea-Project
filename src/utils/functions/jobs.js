// Imports: third-party packages.
const schedule = require('node-schedule');
const axios = require('axios');
const appleReceiptVerify = require('node-apple-receipt-verify');

// Imports: local files.
const env = require('./env');
const { AQI, Cronjob, User, Subscription, SubscriptionType, PredictionAQI } = require('../../models');
const { subscriptions } = require('../../configs');

const getAQI = async () => {
  try {
    const aqi = await axios.get('https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=0');
    const aqiData = aqi.data;

    for (let i = 0; i < aqiData.length; i++) {
      if (!aqiData[i]) continue;

      const { localtime, x, y, pm10, pm25, no2, so2, o3, index, name } = aqiData[i];
      const geometry = { type: 'Point', coordinates: [x, y] };
      const geoJSON = {
        localtime,
        location: { ...geometry },
        pm10,
        pm25,
        no2,
        so2,
        o3,
        index,
        name,
        longitude: x,
        latitude: y,
      };

      await AQI.create(geoJSON);
    }

    const before12hours = new Date(Date.now() - 1000 * 60 * 60 * 12);
    await AQI.deleteMany({ createdAt: { $lte: before12hours } });

    await Cronjob.create({
      type: 'GET_AQI',
      success: true,
      information: {},
    });
  } catch (error) {
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

const getPredictionAQI = async () => {
  try {
    const aqi = await axios.get(
      'https://airqualitykosova.rks-gov.net/dataservices/open/ForecastDataJSON?offsetHour=36'
    );
    const aqiData = aqi.data;

    const now = new Date(Date.now());
    for (let i = 0; i < aqiData.length; i++) {
      if (!aqiData[i]) continue;

      const { localtime, x, y, pm10, pm25, no2, so2, o3, index, name } = aqiData[i];
      const geometry = { type: 'Point', coordinates: [x, y] };
      const geoJSON = {
        localtime,
        location: { ...geometry },
        pm10,
        pm25,
        no2,
        so2,
        o3,
        index,
        name,
        longitude: x,
        latitude: y,
      };

      await PredictionAQI.create(geoJSON);
    }

    // const before12hours = new Date(Date.now() - 1000 * 60 * 60 * 12);
    await PredictionAQI.deleteMany({ createdAt: { $lte: now } });

    await Cronjob.create({
      type: 'GET_PREDICTION_AQI',
      success: true,
      information: {},
    });
  } catch (error) {
    await Cronjob.create({
      type: 'GET_PREDICTION_AQI',
      success: false,
      information: { error: error.message || 'Server Error' },
    });
  }
};

// getAQI();
// getPredictionAQI();

// Function that is used to init all jobs.
const initJobs = () => {
  schedule.scheduleJob('0 * * * *', async () => {
    await getAQI();
  });

  schedule.scheduleJob('0 20 * * *', async function (fireDate) {
    await checkSubscriptions();
  });

  schedule.scheduleJob('0 0 * * *', async function (fireDate) {
    await getPredictionAQI();
  });
};

// Exports of this file.
module.exports = initJobs;
