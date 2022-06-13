// Imports: local files.
const { InformativeRecommendation, BaseRecommendation, RecommendationCard } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, checkValidValues } = require('../utils/functions');
const { httpCodes, staticValues } = require('../configs');

/**
 * @description Get all recommendations.
 * @route       GET /api/recommendations.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
    select: select
      ? filterValues(select, ['haveDiseaseDiagnosis', 'hasChildren', 'hasChildrenDisease', 'energySource'])
      : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  const query = { isDeleted: false };
  const informativeRecommendations = await InformativeRecommendation.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { informativeRecommendations }, error: null });
  return;
});

/**
 * @description Get recommandation by id.
 * @route       GET /api/informativerecommendations/:informativeRecommendationId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { informativeRecommendationId } = request.params;

  const informativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendationId,
    isDeleted: false,
  });
  if (!informativeRecommendation) {
    next(new ApiError('Informative Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { informativeRecommendation }, error: null });
  return;
});

const getRandomOne = asyncHandler(async (request, response, next) => {
  const { type } = request.body;

  // const userInfo = {
  //   age: '20-30',
  //   gender: 'male',
  //   haveDiseaseDiagnosis: ['Semundjet te frymarrjes/mushkerive', 'Semundje te zemres (kardiovaskulare)'],
  //   energySource: ['Qymyr', 'Gas', 'Zjarr/dru'],
  //   hasChildren: true,
  //   hasChildrenDisease: ['Diabetin', 'Semundje neurologjike'],
  //   aqi: 250,
  //   city: 'prishtina',
  // };

  const userInfo = {
    age: '20-30',
    gender: 'male',
    haveDiseaseDiagnosis: ['Semundje neurologjike'],
    energySource: ['Gas', 'Zjarr/dru'],
    hasChildren: true,
    hasChildrenDisease: ['Semundjet te frymarrjes/mushkerive'],
    aqi: 250,
    city: 'prishtina',
  };

  // const l1 = `https://api.waqi.info/feed/${userInfo.city}/?token=6d89115c91ee8318a4b745ea2424e2e09c41fc43`;

  // const waqiResult = await axios.get(l1);

  // if (!waqiResult) {
  //   next(new ApiError(' Failed to get waqi result !', httpCodes.NOT_FOUND));
  //   return;
  // }

  // const fetchedAqi = waqiResult.data.data.aqi;

  let airQuery = '';

  // if (fetchedAqi >= 1 && fetchedAqi <= 50) {
  //   airQuery = 'E mire';
  // } else if (fetchedAqi > 50 && fetchedAqi <= 100) {
  //   airQuery = 'E pranueshme';
  // } else if (fetchedAqi > 100 && fetchedAqi <= 150) {
  //   airQuery = 'Mesatare';
  // } else if (fetchedAqi > 150 && fetchedAqi <= 200) {
  //   airQuery = 'E dobet';
  // } else {
  //   airQuery = 'Shume e dobet';
  // }

  if (userInfo.aqi >= 1 && userInfo.aqi <= 50) {
    airQuery = 'E mire';
  } else if (userInfo.aqi > 50 && userInfo.aqi <= 100) {
    airQuery = 'E pranueshme';
  } else if (userInfo.aqi > 100 && userInfo.aqi <= 150) {
    airQuery = 'Mesatare';
  } else if (userInfo.aqi > 150 && userInfo.aqi <= 200) {
    airQuery = 'E dobet';
  } else {
    airQuery = 'Shume e dobet';
  }

  // const query1A = {
  //   $and: [
  //     { haveDiseaseDiagnosis: { $size: 1, $all: userInfo.haveDiseaseDiagnosis } },
  //     { energySource: { $size: 2, $all: userInfo.energySource } },
  //     { hasChildrenDisease: { $size: 1, $all: userInfo.hasChildrenDisease } },
  //   ],
  // };

  const query1A = {
    $and: [
      { haveDiseaseDiagnosis: { $size: userInfo.haveDiseaseDiagnosis.length, $all: userInfo.haveDiseaseDiagnosis } },
      { energySource: { $size: userInfo.energySource.length, $all: userInfo.energySource } },
      { hasChildrenDisease: { $size: userInfo.hasChildrenDisease.length, $all: userInfo.hasChildrenDisease } },
    ],
  };

  // All values of array matches for either field (order matters here)
  const query1 = {
    $or: [
      { haveDiseaseDiagnosis: userInfo.haveDiseaseDiagnosis },
      { energySource: userInfo.energySource },
      { hasChildrenDisease: userInfo.hasChildrenDisease },
    ],
  };

  // All values of array matches for all field (order matters here)
  const query2 = {
    $and: [
      { haveDiseaseDiagnosis: userInfo.haveDiseaseDiagnosis },
      { energySource: userInfo.energySource },
      { hasChildrenDisease: userInfo.hasChildrenDisease },
    ],
  };

  // At least one value in array matches in either field
  const query3 = {
    $or: [
      { haveDiseaseDiagnosis: { $in: userInfo.haveDiseaseDiagnosis } },
      { energySource: { $in: userInfo.energySource } },
      { hasChildrenDisease: { $in: userInfo.hasChildrenDisease } },
    ],
  };

  // At least one value in array matches in all field
  const query4 = {
    $and: [
      { haveDiseaseDiagnosis: { $in: userInfo.haveDiseaseDiagnosis } },
      { energySource: { $in: userInfo.energySource } },
      { hasChildrenDisease: { $in: userInfo.hasChildrenDisease } },
    ],
  };

  // All values where haveDisease is equal with at least specified values and haveDiseaseDiagnosis array is not at size {....}
  const query5 = {
    $and: [
      {
        $nor: [
          { haveDiseaseDiagnosis: { $exists: false } },
          { haveDiseaseDiagnosis: { $size: 1 } },
          { haveDiseaseDiagnosis: { $size: 2 } },
          { haveDiseaseDiagnosis: { $size: 3 } },
        ],
      },
      {
        haveDiseaseDiagnosis: {
          $in: [
            'Semundjet te frymarrjes/mushkerive',
            'Semundje te zemres (kardiovaskulare)',
            'Diabetin',
            'Semundje neurologjike',
          ],
        },
      },
    ],
  };

  // All values where age length is at least equal to specified value (in our case to test if it includes all ages)
  const query6 = {
    $nor: [
      { age: { $exists: false } },
      { age: { $size: 0 } },
      { age: { $size: 1 } },
      { age: { $size: 2 } },
      { age: { $size: 3 } },
      { age: { $size: 4 } },
      { age: { $size: 5 } },
    ],
  };

  const query = {
    isDeleted: false,
    ...query1A,
    type,
    airQuality: airQuery,
  };

  const recommendations = await Recommendation.find(query);

  const allRecommendationCards = [];

  for (const recommendation of recommendations) {
    const recommendationCards = recommendation.recommendationCards;

    for (const recommendationCard of recommendationCards) allRecommendationCards.push(recommendationCard);
  }

  const randomRecommendationCard = allRecommendationCards[parseInt(Math.random() * allRecommendationCards.length, 10)];

  response.status(httpCodes.OK).json({
    success: true,
    data: {
      recommendationCount: recommendations.length,
      recommendations,
      recommendationCardsCount: allRecommendationCards.length,
      allRecommendationCards,
      randomRecommendationCard,
    },
    error: null,
  });
  return;
});

/**
 * @description Create a informative recommendation.
 * @route       POST /api/informativerecommendations.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';
  const { name, description, baseRecommendationsId, isGeneric } = request.body;

  const informativeRecommendationExists =
    (await InformativeRecommendation.countDocuments({ name, isDeleted: false })) > 0;
  if (informativeRecommendationExists) {
    next(new ApiError('Informative Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    description,
    isGeneric,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const informativeRecommendation = await InformativeRecommendation.create(payload);
  if (!informativeRecommendation) {
    next(new ApiError('Failed to create new informative recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  for (const baseRecommendationId of baseRecommendationsId) {
    const updatedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendationId },
      {
        $push: { informativeRecommendations: informativeRecommendation._id },
      }
    );

    if (!updatedBaseRecommendation) {
      next(new ApiError('Failed to update Base Recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }

    const updatedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      {
        $push: { baseRecommendations: updatedBaseRecommendation._id },
      }
    );

    if (!updatedInformativeRecommendation) {
      next(new ApiError('Failed to update Informative Recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { informativeRecommendation }, error: null });
  return;
});

/**
 * @description Update a informative recommendation.
 * @route       PUT /api/informativerecommendations/:informativeRecommendationId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';
  const { informativeRecommendationId } = request.params;
  const { name, description, isGeneric } = request.body;

  const informativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendationId,
    isDeleted: false,
  });
  if (!informativeRecommendation) {
    next(new ApiError('Informative Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    description,
    isGeneric,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };

  const editedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
    { _id: informativeRecommendation._id },
    { $set: payload },
    { new: true }
  );
  if (!editedInformativeRecommendation) {
    next(new ApiError('Failed to update informative recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { informativeRecommendation: editedInformativeRecommendation }, error: null });
  return;
});

/**
 * @description Delete a informative recommendation.
 * @route       DELETE /api/informativeRecommendations/:informativeRecommendationId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';
  const { informativeRecommendationId } = request.params;

  const informativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendationId,
    isDeleted: false,
  });
  if (!informativeRecommendation) {
    next(new ApiError('Informative Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
    { _id: informativeRecommendation._id },
    {
      $set: {
        isDeleted: true,
        recommendationCards: [],
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedInformativeRecommendation) {
    next(new ApiError('Failed to delete informative recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  for (const baseRecommendation of informativeRecommendation.baseRecommendations) {
    const updatedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendation._id },
      { $pull: { informativeRecommendations: informativeRecommendation._id } }
    );
    if (!updatedBaseRecommendation) {
      next(new ApiError('Failed to update base recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const deletedRecommendationCards = await RecommendationCard.updateMany(
    { recommendation: informativeRecommendation._id },
    {
      $set: {
        isDeleted: true,
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    }
  );
  if (!deletedRecommendationCards) {
    next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { deletedInformativeRecommendation }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne, getRandomOne };
