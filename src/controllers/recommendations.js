const Recommendation = require('../models/Recommendation');
const RecommendationCard = require('../models/RecommendationCard');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');

const { httpCodes } = require('../configs');

// /**
//  * @description Get all recommendations.
//  * @route       GET /api/recommendations.
//  * @access      Public.
//  */
// const getAll = asyncHandler(async (request, response) => {
//   const { page, limit, select, sort } = request.query;

//   // We get it from the user when the user log's in
//   const userInfo = {
//     age: '20-30',
//     gender: 'male',
//     haveDiseaseDiagnosis: ['N'],
//     energySource: ['B'],
//     hasChildren: true,
//     hasChildrenDisease: ['V'],
//   };

//   // if (userInfo.hasChildren) {
//   //   userInfo.hasChildrenDisease = ['V'];
//   // }

//   const query = {
//     isDeleted: false,
//     // At least one value in array matches in either field
//     $or: [
//       { haveDiseaseDiagnosis: { $in: userInfo.haveDiseaseDiagnosis } },
//       { energySource: { $in: userInfo.energySource } },
//       { hasChildrenDisease: { $in: userInfo.hasChildrenDisease } },
//     ],
//   };

//   const options = {
//     page: parseInt(page, 10),
//     limit: parseInt(limit, 10),
//     select: select
//       ? //? filterValues(select, ['haveDiseaseDiagnosis', 'hasChildren', 'hasChildrenDisease', 'energySource'])
//         filterValues(select, [])
//       : 'name description',
//     sort: sort ? request.query.sort.split(',').join(' ') : 'name',
//     populate: 'recommendationCards',
//   };
//   const recommendations = await Recommendation.paginate(query, options);

//   response.status(httpCodes.OK).json({ success: true, data: { recommendations }, error: null });
// });

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

/**
 * @description Get a random recommendationCard from quried recommendation.
 * @route       GET /api/recommendations/randomRecCardFromRec.
 * @access      Public.
 */
const getRandomOne = asyncHandler(async (request, response, next) => {
  const userInfo = {
    age: '20-30',
    gender: 'male',
    haveDiseaseDiagnosis: ['AB'],
    energySource: ['UV'],
    hasChildren: true,
    hasChildrenDisease: ['YZ'],
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

  // All values where age length is at least equal to specified value (in our case to test if it includes all ages )
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
    ...query6,
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
 * @description Create random recommendations (This is used just for testing)
 * @route       POST /api/recommendations/randomRecommendations/:numberOfRecommendations.
 * @access      Public.
 */
const createRandomRecommendations = asyncHandler(async (request, response, next) => {
  const nrOfRec = request.params.numberOfRecommendations;

  const recommendations = [];

  for (let i = 0; i < nrOfRec; i++) {
    const haveDiseaseDiagnosis = [];
    const energySource = [];
    const hasChildrenDisease = [];
    const gender = [];
    const age = [];
    const recommendationCards = [];

    const haveDiseaseDiagnosisAvailableValues = [
      'Semundjet te frymarrjes/mushkerive',
      'Semundje te zemres (kardiovaskulare)',
      'Diabetin',
      'Semundje neurologjike',
    ];

    for (let i = 0; i < parseInt(Math.random() * haveDiseaseDiagnosisAvailableValues.length, 10); i++) {
      const haveDiseaseValue =
        haveDiseaseDiagnosisAvailableValues[parseInt(Math.random() * haveDiseaseDiagnosisAvailableValues.length, 10)];

      if (!haveDiseaseDiagnosis.includes(haveDiseaseValue)) {
        haveDiseaseDiagnosis.push(haveDiseaseValue);
      }
    }

    const energySourceAvailableValues = ['Qymyr', 'Gas', 'Rryme elektrike', 'Zjarr/dru'];

    for (let i = 0; i < parseInt(Math.random() * energySourceAvailableValues.length, 10); i++) {
      const haveSourceValue =
        energySourceAvailableValues[parseInt(Math.random() * energySourceAvailableValues.length, 10)];

      if (!energySource.includes(haveSourceValue)) {
        energySource.push(haveSourceValue);
      }
    }

    const randomNumForGender = parseInt(1 + Math.random() * 3, 10);

    if (randomNumForGender === 1) {
      gender.push('Male');
    } else if (randomNumForGender === 2) {
      gender.push('Female');
    } else {
      gender.push('Male');
      gender.push('Female');
    }

    const agesAvailable = ['0-19', '20-29', '30-39', '40-49', '50-59', '>65'];

    for (let i = 0; i < parseInt(1 + Math.random() * agesAvailable.length, 10); i++) {
      const ageValue = agesAvailable[parseInt(Math.random() * agesAvailable.length, 10)];

      if (!age.includes(ageValue)) {
        age.push(ageValue);
      }
    }

    const hasChildrenDiseaseAvailableValues = [
      'Semundjet te frymarrjes/mushkerive',
      'Semundje te zemres (kardiovaskulare)',
      'Diabetin',
      'Semundje neurologjike',
    ];

    for (let i = 0; i < parseInt(Math.random() * hasChildrenDiseaseAvailableValues.length, 10); i++) {
      const haveChildrenDiseaseValue =
        hasChildrenDiseaseAvailableValues[parseInt(Math.random() * hasChildrenDiseaseAvailableValues.length, 10)];

      if (!hasChildrenDisease.includes(haveChildrenDiseaseValue)) {
        hasChildrenDisease.push(haveChildrenDiseaseValue);
      }
    }

    const payload = {
      name: randomString(40),
      description: randomString(50),
      weather: randomString(15),
      gender,
      age,
      aqi: 1 + parseInt(Math.random() * 499, 10),
      haveDiseaseDiagnosis,
      energySource,
      hasChildren: true,
      hasChildrenDisease,
      category: 'RandomTestCat',
    };

    const createdRecommendation = await Recommendation.create(payload);

    for (let i = 0; i < 1 + parseInt(Math.random() * 8, 10); i++) {
      const recommendationCard = new RecommendationCard({
        name: randomString(40),
        description: randomString(50),
        recommendation: createdRecommendation._id,
        createdAt: new Date(Date.now()),
      });

      await recommendationCard.save();

      recommendationCards.push(recommendationCard);
    }

    createdRecommendation.recommendationCards = recommendationCards;
    await createdRecommendation.save();

    recommendations.push(createdRecommendation);
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendations }, error: null });
});

// /**
//  * @description Create random recommendations (This is used just for testing)
//  * @route       POST /api/recommendations/randomRecommendations/:numberOfRecommendations.
//  * @access      Public.
//  */
// const createRandomRecommendations = asyncHandler(async (request, response, next) => {
//   const nrOfRec = request.params.numberOfRecommendations;

//   const recommendations = [];

//   for (let i = 0; i < nrOfRec; i++) {
//     const haveDiseaseDiagnosis = [];
//     const energySource = [];
//     const hasChildrenDisease = [];
//     const gender = [];
//     const age = [];
//     const recommendationCards = [];

//     for (let i = 0; i < 1 + parseInt(Math.random() * 4, 10); i++) {
//       haveDiseaseDiagnosis.push(randomString(1 + parseInt(Math.random() * 3, 10)));
//     }

//     for (let i = 0; i < 1 + parseInt(Math.random() * 4, 10); i++) {
//       energySource.push(randomString(1 + parseInt(Math.random() * 3, 10)));
//     }

//     const randomNumForGender = parseInt(1 + Math.random() * 3, 10);

//     if (randomNumForGender === 1) {
//       gender.push('Male');
//     } else if (randomNumForGender === 2) {
//       gender.push('Female');
//     } else {
//       gender.push('Male');
//       gender.push('Female');
//     }

//     const agesAvailable = ['0-19', '20-29', '30-39', '40-49', '50-59', '>65'];

//     for (let i = 0; i < 1 + parseInt(Math.random() * agesAvailable.length, 10); i++) {
//       const ageValue = agesAvailable[parseInt(Math.random() * agesAvailable.length, 10)];

//       if (!age.includes(ageValue)) {
//         age.push(ageValue);
//       }
//     }

//     for (let i = 0; i < 1 + parseInt(Math.random() * 4, 10); i++) {
//       hasChildrenDisease.push(randomString(1 + parseInt(Math.random() * 3, 10)));
//     }

//     const payload = {
//       name: randomString(40),
//       description: randomString(50),
//       weather: randomString(15),
//       gender,
//       age,
//       aqi: 1 + parseInt(Math.random() * 499, 10),
//       haveDiseaseDiagnosis,
//       energySource,
//       hasChildren: true,
//       hasChildrenDisease,
//       category: 'RandomTestCat',
//     };

//     const createdRecommendation = await Recommendation.create(payload);

//     for (let i = 0; i < 1 + parseInt(Math.random() * 8, 10); i++) {
//       const recommendationCard = new RecommendationCard({
//         name: randomString(40),
//         description: randomString(50),
//         recommendation: createdRecommendation._id,
//         createdAt: new Date(Date.now()),
//       });

//       await recommendationCard.save();

//       recommendationCards.push(recommendationCard);
//     }

//     createdRecommendation.recommendationCards = recommendationCards;
//     await createdRecommendation.save();

//     recommendations.push(createdRecommendation);
//   }

//   response.status(httpCodes.OK).json({ success: true, data: { recommendations }, error: null });
// });

function randomString(length) {
  let result = '';
  //let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  //let characters = 'ABCIJLMNUVXYZ';
  let characters = 'ABCUVXYZ';
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result = result + characters.charAt(parseInt(Math.random() * charactersLength, 10));
  }

  return result;
}

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
module.exports = { getAll, getOne, create, deleteOne, updateOne, getRandomOne, createRandomRecommendations };
