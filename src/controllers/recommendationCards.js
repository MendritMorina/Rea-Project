const RecommendationCard = require('../models/RecommendationCard');
const Recommendation = require('../models/Recommendation');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');

const { httpCodes } = require('../configs');

/**
 * @description Get all recommendationCards.
 * @route       GET /api/recommendationcards.
 * @route       GET /api/recommendations/:recommendationId/recommendationcards.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select ? filterValues(select, ['name']) : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendation',
  };

  const query = {
    isDeleted: false,
  };

  let recommendationCards = null;
  if (request.params.recommendationId) {
    recommendationCards = await RecommendationCard.paginate(
      { ...query, recommendation: request.params.recommendationId },
      options
    );
  } else {
    recommendationCards = await RecommendationCard.paginate(query, options);
  }

  return response.status(200).json({ success: true, data: { recommendationCards }, error: null });
});

/**
 * @description Get recommandationCard by id.
 * @route       GET /api/recommendationcards/:recommendationCardId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response) => {
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false })
    .select('name description')
    .populate('recommendation');

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { recommendationCard }, error: null });
});

/**
 * @description Create a recommendationCard.
 * @route       POST /api/recommendationcards/.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { name, description, recommendationId } = request.body;

  const recommendation = await Recommendation.findOne({ _id: recommendationId, isDeleted: false });

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    description,
    recommendation: recommendation._id,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const recommendationCard = await RecommendationCard.create(payload);

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard was not created', httpCodes.NOT_FOUND));
    return;
  }

  const updatedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendation._id },
    {
      $push: { recommendationCards: recommendationCard._id },
    }
  );

  return response
    .status(httpCodes.CREATED)
    .json({ success: true, data: { recommendationCard, updatedRecommendation }, error: null });
});

/**
 * @description Update a recommendationCard.
 * @route       PUT /api/recommendationcards/:recommendationCardId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { recommendationCardId } = request.params;
  const { name, description, recommendationId } = request.body;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== recommendationCard.name) {
    const recommendationExists =
      (await RecommendationCard.countDocuments({ _id: { $ne: recommendationCardId }, name, isDeleted: false })) > 0;
    if (recommendationExists) {
      next(new ApiError('RecommendationCard with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    description,
    recommendation: recommendationId ? recommendationId : recommendationCard.recommendation,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };

  const editedRecommendationCard = await RecommendationCard.findOneAndUpdate(
    { _id: recommendationCard._id },
    {
      $set: payload,
    },
    { new: true }
  );

  if (!editedRecommendationCard) {
    next(new ApiError('Failed to update RecommendationCard!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const recommendation = await Recommendation.findOne({
    _id: editedRecommendationCard.recommendation,
    isDeleted: false,
  });

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (recommendationId !== recommendationCard.recommendation && recommendationId !== null) {
    await Recommendation.findOneAndUpdate(
      { _id: recommendationCard.recommendation },
      {
        $pull: { recommendationCards: recommendationCard._id },
      }
    );

    await Recommendation.findOneAndUpdate(
      { _id: editedRecommendationCard.recommendation },
      {
        $push: { recommendationCards: editedRecommendationCard._id },
      }
    );
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { recommendationCard: editedRecommendationCard }, error: null });
});

/**
 * @description Delete a RecommendationCard.
 * @route       DELETE /api/recommendationcards/:recommendationCardId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  const recommendation = await Recommendation.findOne({ _id: recommendationCard.recommendation, isDeleted: false });

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedRecommendationCard = await RecommendationCard.findOneAndUpdate(
    { _id: recommendationCardId },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedRecommendationCard) {
    next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const updatedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendation._id },
    {
      $pull: { recommendationCards: recommendationCard._id },
    }
  );

  if (!updatedRecommendation) {
    next(new ApiError('Failed to update recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { recommendationCard: deletedRecommendationCard }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
