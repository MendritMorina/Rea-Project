const Recommendation = require('../models/Recommendation');
const RecommendationCard = require('../models/RecommendationCard');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');

const { httpCodes } = require('../configs');

/**
 * @description Get all recommendations.
 * @route       GET /api/recommendations.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select
      ? filterValues(select, ['haveDiseaseDiagnosis', 'hasChildren', 'hasChildrenDisease', 'energySource'])
      : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  const query = {
    isDeleted: false,
  };

  const recommendations = await Recommendation.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { recommendations }, error: null });
});

/**
 * @description Get recommandation by id.
 * @route       GET /api/recommendations/:recommendationId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { recommendationId } = request.params;

  // const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false }).select(
  //   'name description recommendationCards'
  // );

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false });

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendation }, error: null });
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

  const query1A = {
    $and: [
      { haveDiseaseDiagnosis: { $size: 1, $all: userInfo.haveDiseaseDiagnosis } },
      { energySource: { $size: 2, $all: userInfo.energySource } },
      { hasChildrenDisease: { $size: 1, $all: userInfo.hasChildrenDisease } },
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

    for (const recommendationCard of recommendationCards) {
      allRecommendationCards.push(recommendationCard);
    }
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
});

/**
 * @description Create a recommendation.
 * @route       POST /api/recommendations.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    category,
  } = request.body;

  const recommendationExists = (await Recommendation.countDocuments({ name, isDeleted: false })) > 0;
  if (recommendationExists) {
    next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    category,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const recommendation = await Recommendation.create(payload);
  if (!recommendation) {
    next(new ApiError('Failed to create new recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { recommendation }, error: null });
});

/**
 * @description Update a recommendation.
 * @route       PUT /api/recommendations/:recommendationId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { recommendationId } = request.params;
  const {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    category,
  } = request.body;

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== recommendation.name) {
    const recommendationExists =
      (await Recommendation.countDocuments({ _id: { $ne: recommendation._id }, name, isDeleted: false })) > 0;
    if (recommendationExists) {
      next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    description,
    weather,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    hasChildren,
    hasChildrenDisease,
    category,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };
  const editedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendation._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedRecommendation) {
    next(new ApiError('Failed to update recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendation: editedRecommendation }, error: null });
});

/**
 * @description Delete a recommendation.
 * @route       DELETE /api/recommendations/:recommendationId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { recommendationId } = request.params;

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendationId },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
        recommendationCards: [],
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedRecommendation) {
    next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const deletedRecommendationCards = await RecommendationCard.updateMany(
    { recommendation: recommendationId },
    {
      $set: {
        isDeleted: true,
        recommendation: null,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    }
  );

  if (!deletedRecommendationCards) {
    next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendation: deletedRecommendation }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne, getRandomOne };
