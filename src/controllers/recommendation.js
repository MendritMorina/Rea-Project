const Recommendation = require('../models/Recommendation');
const RecommendationCard = require('../models/RecommendationCard');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');

/**
 * @description Get all Recommendations.
 * @route       GET /api/recommendations.
 * @access      Public.
 */
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, select, sort } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select ? req.query.select.split(',').join(' ') : 'name description',
    sort: sort ? req.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  // const recommendations = await Recommendation.find()
  //   .select('name description recommendationCards')
  //   .populate('recommendationCards');

  const recommendations = await Recommendation.paginate({}, options);

  res.status(200).json({ success: true, count: recommendations.length, data: recommendations, error: null });
});

/**
 * @description Get Recommandation by id.
 * @route       GET /api/recommendations/:id.
 * @access      Public.
 */
const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false }).select(
    'name description recommendationCards'
  );

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendation }, error: null });
});

/**
 * @description Create a recommendation.
 * @route       POST /api/recommendations/create.
 * @access      Private.
 */

const create = asyncHandler(async (req, res, next) => {
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
  } = req.body;

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

  res.status(httpCodes.OK).json({ success: true, data: recommendation, error: null });
});

/**
 * @description Delete a recommendation.
 * @route       DELETE /api/recommendations/:id.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
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
    { recommendation: id },
    {
      $set: {
        isDeleted: true,
        recommendation: null,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    }
  );

  const recommendationCards = await RecommendationCard.find({ reccomendation: id });

  recommendationCards.forEach(async (recommendationCard) => {
    // await recommendation.updateOne({
    //   $pull: { recommendationCards: recommendationCard._id },
    // });
    await Recommendation.findOneAndUpdate(
      { _id: recommendation._id },
      {
        $pull: { recommendationCards: recommendationCard._id },
      }
    );
  });

  if (!deletedRecommendationCards) {
    next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendation: deletedRecommendation }, error: null });
});

/**
 * @description Update a recommendation.
 * @route       PUT /api/recommendations/:id.
 * @access      Private.
 */
const updateOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;
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
  } = req.body;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false });
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

  res.status(httpCodes.OK).json({ success: true, data: { recommendation: editedRecommendation }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
