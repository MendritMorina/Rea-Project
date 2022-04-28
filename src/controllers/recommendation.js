const Recommendation = require('../models/Recommendation');
const RecommendationCard = require('../models/RecommendationCard');

const { asyncHandler } = require('../middlewares');
const { filterValues } = require('../middlewares');

const { ApiError } = require('../utils/classes');
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
          .split(',')
          .join(' ')
      : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  // const recommendations = await Recommendation.find()
  //   .select('name description recommendationCards')
  //   .populate('recommendationCards');

  const recommendations = await Recommendation.paginate({}, options);

  response.status(200).json({ success: true, count: recommendations.length, data: recommendations, error: null });
});

/**
 * @description Get recommandation by id.
 * @route       GET /api/recommendations/:recommendationId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response) => {
  const { recommendationId } = request.params;

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false }).select(
    'name description recommendationCards'
  );

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendation }, error: null });
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
    recommendationCards,
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
    recommendationCards,
    category,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const recommendation = await Recommendation.create(payload);
  if (!recommendation) {
    next(new ApiError('Failed to create new recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: recommendation, error: null });
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
    recommendationCards,
    category,
  } = request.body;

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== recommendation.name) {
    const recommendationExists =
      (await Recommendation.countDocuments({ _id: { $ne: id }, name, isDeleted: false })) > 0;
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
    recommendationCards,
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

  // const recommendationCards = await RecommendationCard.find({ reccomendation: id });

  // recommendationCards.forEach(async (recommendationCard) => {
  //   // await recommendation.updateOne({
  //   //   $pull: { recommendationCards: recommendationCard._id },
  //   // });
  //   await Recommendation.findOneAndUpdate(
  //     { _id: recommendation._id },
  //     {
  //       $pull: { recommendationCards: recommendationCard._id },
  //     }
  //   );
  // });

  if (!deletedRecommendationCards) {
    next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendation: deletedRecommendation }, error: null });
});

// function filterValuesFromSelect(select, removeValues) {
//   const arraySelect = select.split(',');
//   const newArray = [];

//   const newArraySelect = removeDuplicates(arraySelect);

//   for (let i = 0; i < newArraySelect.length; i++) {
//     if (notContainsValue(newArraySelect[i], removeValues)) {
//       newArray.push(newArraySelect[i]);
//     }
//   }

//   function removeDuplicates(arr) {
//     return arr.filter((item, index) => arr.indexOf(item) === index);
//   }

//   function notContainsValue(selectValue, removeValues) {
//     for (let i = 0; i < removeValues.length; i++) {
//       if (selectValue === removeValues[i]) {
//         return false;
//       }
//     }
//     return true;
//   }

//   return newArray.join(',');
// }

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
