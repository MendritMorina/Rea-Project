// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: local files.
const { RecommendationCard, BaseRecommendation, InformativeRecommendation, User, AQI } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, getMode, distance } = require('../utils/functions');
const aqiCalculator = require('../utils/functions/aqi/aqi-calculator');
const { httpCodes } = require('../configs');

/**
 * @description Get all recommendationCards.
 * @route       GET /api/recommendationcards.
 * @route       GET /api/recommendations/:recommendationId/recommendationcards.
 * @route       GET /api/baserecommendations/:baseRecommendationId/recommendationcards.
 * @route       GET /api/informativerecommendations/:informativeRecommendationId/recommendationcards.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
    select: select ? filterValues(select, []) : 'name description photo thumbnail viewCounter recommendation type',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
  };

  let paramsQuery = {};

  if (request.params.baseRecommendationId) {
    paramsQuery = { recommendation: request.params.baseRecommendationId, type: 'base' };
  } else if (request.params.informativeRecommendationId) {
    paramsQuery = { recommendation: request.params.informativeRecommendationId, type: 'informative' };
  }

  const query = {
    isDeleted: false,
    ...paramsQuery,
  };

  const recommendationCards = await RecommendationCard.paginate(query, options);

  response.status(200).json({ success: true, data: { recommendationCards }, error: null });
  return;
});

/**
 * @description Get recommandationCard by id.
 * @route       GET /api/recommendationcards/:recommendationCardId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false }).populate(
    'recommendation'
  );
  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendationCard }, error: null });
  return;
});

/**
 * @description Create a recommendationCard.
 * @route       POST /api/base/recommendationcards.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { recommendationId, type } = request.body;

  let recommendationCard = null;

  if (type === 'base') {
    const baseRecommendation = await BaseRecommendation.findOne({ _id: recommendationId, isDeleted: false });
    if (!baseRecommendation) {
      next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
      return;
    }

    const payload = {
      type,
      recommendation: baseRecommendation._id,
      createdBy: userId,
      createdAt: new Date(Date.now()),
    };

    recommendationCard = await RecommendationCard.create(payload);
    if (!recommendationCard) {
      next(new ApiError('RecommendationCard was not created', httpCodes.NOT_FOUND));
      return;
    }

    const updatedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendation._id },
      {
        $push: { recommendationCards: recommendationCard._id },
      }
    );

    if (!updatedBaseRecommendation) {
      next(new ApiError('Failed to push recommendation card in base recommendation ', httpCodes.NOT_FOUND));
      return;
    }
  } else if (type === 'informative') {
    const informativeRecommendation = await InformativeRecommendation.findOne({
      _id: recommendationId,
      isDeleted: false,
    });
    if (!informativeRecommendation) {
      next(new ApiError('Informative Recommendation not found!', httpCodes.NOT_FOUND));
      return;
    }

    const payload = {
      type,
      recommendation: informativeRecommendation._id,
      createdBy: userId,
      createdAt: new Date(Date.now()),
    };

    recommendationCard = await RecommendationCard.create(payload);
    if (!recommendationCard) {
      next(new ApiError('RecommendationCard was not created', httpCodes.NOT_FOUND));
      return;
    }

    const updatedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      {
        $push: { recommendationCards: recommendationCard._id },
      }
    );

    if (!updatedInformativeRecommendation) {
      next(new ApiError('Failed to push recommendation card in informative recommendation ', httpCodes.NOT_FOUND));
      return;
    }
  } else {
    next(new ApiError('Illegal type!', httpCodes.BAD_REQUEST));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['photo'];

  if (fileTypes.length !== 1) {
    await recommendationCard.remove();
    next(new ApiError('You must input the required file Type!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      await recommendationCard.remove();
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(recommendationCard._id, userId, request, fileTypes);
  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await recommendationCard.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedRecommendationCard = await RecommendationCard.findOne({ _id: recommendationCard._id, isDeleted: false });
  if (!updatedRecommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(200).json({ success: true, data: { updatedRecommendationCard }, error: null });
  return;
});

/**
 * @description Update a recommendationCard.
 * @route       PUT /api/recommendationcards/:recommendationCardId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { recommendationCardId } = request.params;
  //const { name, description, recommendationId, type, toBeDeleted } = request.body;
  const { recommendationId: recommendation, toBeDeleted } = request.body;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  const type = recommendationCard.type;

  if (recommendation && type === 'base') {
    const findBaseRecommendation = await BaseRecommendation.findOne({ _id: recommendation, isDeleted: false });

    if (!findBaseRecommendation) {
      next(new ApiError('Failed to find base recommendation by given id!', httpCodes.NOT_FOUND));
      return;
    }
  } else if (recommendation && type === 'informative') {
    const findInformativeRecommendation = await InformativeRecommendation.findOne({
      _id: recommendation,
      isDeleted: false,
    });

    if (!findInformativeRecommendation) {
      next(new ApiError('Failed to find informative recommendation by given id!', httpCodes.NOT_FOUND));
      return;
    }
  }

  const payload = {
    recommendation,
    //recommendation: recommendationId ? recommendationId : recommendationCard.recommendation,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };

  const editedRecommendationCard = await RecommendationCard.findOneAndUpdate(
    { _id: recommendationCard._id },
    { $set: payload },
    { new: true }
  );
  if (!editedRecommendationCard) {
    next(new ApiError('Failed to update RecommendationCard!', httpCodes.INTERNAL_ERROR));
    return;
  }

  if (recommendation !== recommendationCard.recommendation && recommendation !== null) {
    if (type === 'base') {
      const updatedPullOldBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
        { _id: recommendationCard.recommendation },
        { $pull: { recommendationCards: recommendationCard._id } }
      );

      if (!updatedPullOldBaseRecommendation) {
        next(new ApiError('Failed to pull RecommendationCard from old BaseRecommendation!', httpCodes.INTERNAL_ERROR));
        return;
      }

      const updatedPushNewBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
        { _id: editedRecommendationCard.recommendation },
        { $push: { recommendationCards: editedRecommendationCard._id } }
      );

      if (!updatedPushNewBaseRecommendation) {
        next(new ApiError('Failed to push RecommendationCard to new BaseRecommendation!', httpCodes.INTERNAL_ERROR));
        return;
      }
    } else if (type === 'informative') {
      const updatedPullOldInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
        { _id: recommendationCard.recommendation },
        { $pull: { recommendationCards: recommendationCard._id } }
      );

      if (!updatedPullOldInformativeRecommendation) {
        next(
          new ApiError(
            'Failed to pull RecommendationCard from old InformativeRecommendation!',
            httpCodes.INTERNAL_ERROR
          )
        );
        return;
      }

      const updatedPushNewInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
        { _id: editedRecommendationCard.recommendation },
        { $push: { recommendationCards: editedRecommendationCard._id } }
      );

      if (!updatedPushNewInformativeRecommendation) {
        next(
          new ApiError('Failed to push RecommendationCard to new InformativeRecommendation!', httpCodes.INTERNAL_ERROR)
        );
        return;
      }
    } else {
      next(new ApiError('Recommendation Card has illegal type!', httpCodes.NOT_FOUND));
      return;
    }
  }

  // toBeDeleted array of values
  const availableValues = ['photo'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) editedRecommendationCard[value] = null;
    });

    await editedRecommendationCard.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];
    const requiredTypes = ['photo'];

    if (fileTypes.length !== 1) {
      next(new ApiError('You must input the required file Type!', httpCodes.BAD_REQUEST));
      return;
    }

    for (const fileType of fileTypes) {
      if (!requiredTypes.includes(fileType)) {
        next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
        return;
      }
    }

    // Check if the file name is same in recommendation Card
    if (fileTypes) {
      for (const fileType of fileTypes) {
        if (
          editedRecommendationCard[fileType] &&
          request.files[fileType].name === editedRecommendationCard[fileType].name
        ) {
          next(new ApiError('RecommendationCard file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedRecommendationCard._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const editedFileRecommendationCard = await RecommendationCard.findOne({
    _id: editedRecommendationCard._id,
    isDeleted: false,
  });
  if (!editedFileRecommendationCard) {
    next(new ApiError('Edited File RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { recommendationCard: editedFileRecommendationCard }, error: null });
  return;
});

/**
 * @description Delete a recommendation Card.
 * @route       DELETE /api/recommendationcards/:recommendationCardId.
 * @access      Private.
 */

const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  const type = recommendationCard.type;
  const recommendationId = recommendationCard.recommendation;

  if (type === 'base') {
    const baseRecommendation = await BaseRecommendation.findOne({
      _id: recommendationId,
      isDeleted: false,
    });
    if (!baseRecommendation) {
      next(new ApiError('Base recommendation not found!', httpCodes.NOT_FOUND));
      return;
    }

    const deletedRecommendationCard = await RecommendationCard.findOneAndUpdate(
      { _id: recommendationCard._id },
      {
        $set: {
          isDeleted: true,
          updatedBy: userId,
          updatedAt: new Date(Date.now()),
        },
      },
      { new: true }
    );
    if (!deletedRecommendationCard) {
      next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }

    const updatedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendation._id },
      { $pull: { recommendationCards: recommendationCard._id } }
    );

    if (!updatedBaseRecommendation) {
      next(new ApiError('Failed to update recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }
  } else if (type === 'informative') {
    const informativeRecommendation = await InformativeRecommendation.findOne({
      _id: recommendationId,
      isDeleted: false,
    });

    if (!informativeRecommendation) {
      next(new ApiError('Informative Recommendation not found!', httpCodes.NOT_FOUND));
      return;
    }

    const deletedRecommendationCard = await RecommendationCard.findOneAndUpdate(
      { _id: recommendationCard._id },
      {
        $set: {
          isDeleted: true,
          updatedBy: userId,
          updatedAt: new Date(Date.now()),
        },
      },
      { new: true }
    );

    if (!deletedRecommendationCard) {
      next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }

    const updatedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      { $pull: { recommendationCards: recommendationCard._id } }
    );

    if (!updatedInformativeRecommendation) {
      next(new ApiError('Failed to update informative recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }
  } else {
    next(new ApiError('Illegal type!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendationCard }, error: null });
  return;
});

/**
 * @description Get Base RecommendationCards.
 * @route       GET /api/recommendationcards/baseRecommendationCards
 * @access      Private.
 */
const getBaseRecommendationCards = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { longitude, latitude } = request.query;

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    next(new ApiError('User not found!', httpCodes.NOT_FOUND));
    return;
  }

  const nearestAQIPoint = await AQI.findOne({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 20000,
      },
    },
  });
  if (!nearestAQIPoint) {
    response.status(httpCodes.OK).json({ success: true, data: { furtherThan20km: true }, error: null });
    return;
  }

  const otherAQIs = await AQI.find({
    longitude: nearestAQIPoint.longitude,
    latitude: nearestAQIPoint.latitude,
  })
    .sort('-_id')
    .limit(1);
  const currentAQINearest = otherAQIs && otherAQIs.length ? otherAQIs[0] : null;
  if (!currentAQINearest) {
    next(new ApiError('Couldnt find nearest point!', httpCodes.NOT_FOUND));
    return;
  }

  const { localtime: datetime, pm25, pm10, so2, no2, o3 } = currentAQINearest;
  const aqiData = [{ datetime, pm25, pm10, so2, no2, o3 }];
  const aqiValue = aqiCalculator(aqiData);
  const airQuality = airQualityFromAQI(aqiValue);

  const query = {
    $and: [
      { airQuality: airQuality },
      { haveDiseaseDiagnosis: { $in: user.haveDiseaseDiagnosis } },
      { isPregnant: user.isPregnant },
    ],
  };

  const baseRecommendation = await BaseRecommendation.findOne(query).populate('recommendationCards');
  if (!baseRecommendation) {
    next(new ApiError('Base Recommendation not found based on user information!', httpCodes.NOT_FOUND));
    return;
  }

  const baseRecommendationCards = baseRecommendation.recommendationCards;

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation, baseRecommendationCards }, error: null });
  return;
});

/**
 * @description Get Random InformativeRecommendationCards.
 * @route       GET /api/recommendationcards/randomInformativeRecommendationCards
 * @access      Private.
 */
const getRandomInformativeRecommendationCards = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { longitude, latitude } = request.query;

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    next(new ApiError('User not found!', httpCodes.NOT_FOUND));
    return;
  }

  const nearestAQIPoint = await AQI.findOne({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 20000,
      },
    },
  });
  if (!nearestAQIPoint) {
    response.status(httpCodes.OK).json({ success: true, data: { furtherThan20km: true }, error: null });
    return;
  }

  const otherAQIs = await AQI.find({
    longitude: nearestAQIPoint.longitude,
    latitude: nearestAQIPoint.latitude,
  })
    .sort('-_id')
    .limit(1);
  const currentAQINearest = otherAQIs && otherAQIs.length ? otherAQIs[0] : null;
  if (!currentAQINearest) {
    next(new ApiError('Couldnt find nearest point!', httpCodes.NOT_FOUND));
    return;
  }

  const { localtime: datetime, pm25, pm10, so2, no2, o3 } = currentAQINearest;
  const aqiData = [{ datetime, pm25, pm10, so2, no2, o3 }];
  const aqiValue = aqiCalculator(aqiData);
  const airQuality = airQualityFromAQI(aqiValue);

  const query = {
    $and: [
      { isGeneric: false },
      { isDeleted: false },
      { airQuality: airQuality },
      { haveDiseaseDiagnosis: { $in: user.haveDiseaseDiagnosis } },
      { energySource: { $in: user.energySource } },
      { hasChildren: user.hasChildren },
      { isPregnant: user.isPregnant },
    ],
  };

  if (user.hasChildren && user.hasChildrenDisease && user.hasChildrenDisease.length)
    query['$and'].push({ hasChildrenDisease: { $in: user.hasChildrenDisease } });

  const informativeRecommendations = await InformativeRecommendation.find(query).populate('recommendationCards');

  const genericInfoRecs = await InformativeRecommendation.find({
    isDeleted: false,
    isGeneric: true,
    airQuality: airQuality,
  }).populate('recommendationCards');

  const randoms = [...genericInfoRecs, ...informativeRecommendations];
  const random = randoms[parseInt(Math.random() * randoms.length)];
  if (!random) {
    next(new ApiError('Failed to find the random !', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({
    success: true,
    data: { random },
    error: null,
  });
  return;
});

/**
 * @description Create current AQI.
 * @route       POST /api/recommendationcards/currentAQI
 * @access      Private.
 */
const createCurrentAQI = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { longitude, latitude } = request.body;

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    next(new ApiError('User not found!', httpCodes.NOT_FOUND));
    return;
  }

  const nearestAQIPoint = await AQI.findOne({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 20000,
      },
    },
  });
  if (!nearestAQIPoint) {
    response.status(httpCodes.OK).json({ success: true, data: { furtherThan20km: true }, error: null });
    return;
  }

  const otherAQIs = await AQI.find({
    longitude: nearestAQIPoint.longitude,
    latitude: nearestAQIPoint.latitude,
  })
    .sort('-_id')
    .limit(1);
  const currentAQINearest = otherAQIs && otherAQIs.length ? otherAQIs[0] : null;
  if (!currentAQINearest) {
    next(new ApiError('Couldnt find nearest point!', httpCodes.NOT_FOUND));
    return;
  }

  const { localtime: datetime, pm25, pm10, so2, no2, o3 } = currentAQINearest;
  const aqiData = [{ datetime, pm25, pm10, so2, no2, o3 }];

  const aqiValue = aqiCalculator(aqiData);

  response.status(httpCodes.OK).json({
    success: true,
    data: { aqiValue },
    error: null,
  });
  return;
});
/**
 * @description Get recommandationCard by id and increment its view couter.
 * @route       GET /api/recommendationcards/view/:recommendationCardId.
 * @access      Public.
 */
const viewCardCounter = asyncHandler(async (request, response, next) => {
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  const updatedRecommendationCard = await RecommendationCard.findOneAndUpdate(
    { _id: recommendationCard._id },
    { $inc: { viewCounter: 1 } },
    { new: true }
  );
  if (!updatedRecommendationCard) {
    next(new ApiError('Failed to increment view count of recommendation Card!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { updatedRecommendationCard }, error: null });
  return;
});

// Exports of this file.
module.exports = {
  getAll,
  getOne,
  create,
  deleteOne,
  updateOne,
  getBaseRecommendationCards,
  getRandomInformativeRecommendationCards,
  createCurrentAQI,
  viewCardCounter,
};

// Helpers for this controller.

function airQualityFromAQI(aqi) {
  let airQuality = '';

  if (aqi < 51) {
    airQuality = 'E mirë';
  } else if (aqi >= 51 && aqi < 100) {
    airQuality = 'E pranueshme';
  } else if (aqi >= 101 && aqi < 150) {
    airQuality = 'Mesatare';
  } else if (aqi >= 151 && aqi < 200) {
    airQuality = 'E dobët';
  } else if (aqi >= 200 && aqi < 300) {
    airQuality = 'Shume e dobët';
  } else {
    airQuality = 'Jashtëzakonisht e dobët';
  }

  return airQuality;
}

async function fileResult(recommendationCard, userId, req, fileTypes) {
  if (req.files && Object.keys(req.files).length) {
    const resultObj = {};

    for (const fileType of fileTypes) {
      resultObj[`${fileType}Result`] = null;
    }

    for (const fileType of fileTypes) {
      if (req.files[fileType]) {
        const fileUploadResult = await uploadFile(recommendationCard, userId, req, fileType);
        resultObj[`${fileType}Result`] = fileUploadResult;
      }
    }

    return resultObj;
  }
}

const uploadFile = async (recommendationCardId, userId, request, fileType) => {
  // if (!request.files[fileType]) {
  //   return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  // }

  // const allowedFileTypes = ['photo', 'thumbnail'];

  // if (!allowedFileTypes.includes(fileType)) {
  //   return {
  //     success: false,
  //     data: null,
  //     error: `File Type ${fileType} must be of ${allowedFileTypes}`,
  //     code: httpCodes.BAD_REQUEST,
  //   };
  // }

  const { data, mimetype, name, size } = request.files[fileType];

  const type = mimetype.split('/').pop();

  let allowedTypes = ['jpeg', 'jpg', 'png'];

  if (!allowedTypes.includes(type)) {
    return { success: false, data: null, error: `Wrong ${fileType} type!`, code: httpCodes.BAD_REQUEST };
  }

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId });
  if (!recommendationCard) {
    return {
      success: false,
      data: null,
      error: 'RecommendationCard not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  if (recommendationCard[fileType] && recommendationCard[fileType].name === name) {
    return { success: true, data: { updatedRecommendationCard: recommendationCard }, error: null, code: null };
  }

  const fileName = `${recommendationCard._id}_${fileType}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/recommendationcards/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/public/recommendationcards/${fileName}`;

  const updatedRecommendationCard = await RecommendationCard.findOneAndUpdate(
    { _id: recommendationCard._id },
    {
      $set: {
        [fileType]: {
          url: fileURL,
          name: name,
          mimetype: mimetype,
          size: size,
        },
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!updatedRecommendationCard) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedRecommendationCard }, error: null, code: null };
};
