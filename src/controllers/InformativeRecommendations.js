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
    select: select ? filterValues(select, []) : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  const query = { isDeleted: false };
  const informativeRecommendations = await InformativeRecommendation.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { informativeRecommendations }, error: null });
  return;
});

/**
 * @description Get informative recommandation by id.
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
module.exports = { getAll, getOne, create, deleteOne, updateOne };
