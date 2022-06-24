// Imports: local files.
const { InformativeRecommendation, BaseRecommendation, RecommendationCard } = require('../models');
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
  const userId = request.admin._id;
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

  const latestUpdatedInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendation._id,
    isDeleted: false,
  });
  if (!latestUpdatedInformativeRecommendation) {
    next(new ApiError('Informative Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.CREATED)
    .json({ success: true, data: { latestUpdatedInformativeRecommendation }, error: null });
  return;
});

/**
 * @description Update a informative recommendation.
 * @route       PUT /api/informativerecommendations/:informativeRecommendationId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { informativeRecommendationId } = request.params;
  const { name, description, isGeneric, pullFromId, pushToId } = request.body;

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

  if (pullFromId) {
    // && informativeRecommendation.baseRecommendations.includes(pullFromId)

    const baseRecommendation = await BaseRecommendation.findOne({ _id: pullFromId, isDeleted: false });

    if (!baseRecommendation) {
      next(new ApiError("The given Base Recommendation to pull to doesn't exist!", httpCodes.NOT_FOUND));
      return;
    }

    if (!baseRecommendation.informativeRecommendations.includes(informativeRecommendation._id)) {
      next(
        new ApiError("The Base Recommendation doesn't contains the Informative Recommendation!", httpCodes.NOT_FOUND)
      );
      return;
    }

    if (!informativeRecommendation.baseRecommendations.includes(baseRecommendation._id)) {
      next(
        new ApiError(
          "Informative recommendation doesn't contain the base recommendation with given id!",
          httpCodes.INTERNAL_ERROR
        )
      );
      return;
    }

    const editedPullBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendation._id },
      { $pull: { informativeRecommendations: informativeRecommendation._id } }
    );

    if (!editedPullBaseRecommendation) {
      next(
        new ApiError('Failed to pull Informative recommendation from Base recommendation!', httpCodes.INTERNAL_ERROR)
      );
      return;
    }

    const editedPullInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      { $pull: { baseRecommendations: baseRecommendation._id } }
    );

    if (!editedPullInformativeRecommendation) {
      next(
        new ApiError('Failed to pull Base recommendation from Informative recommendation!', httpCodes.INTERNAL_ERROR)
      );
      return;
    }
  }

  if (pushToId) {
    const baseRecommendation = await BaseRecommendation.findOne({ _id: pushToId, isDeleted: false });

    if (!baseRecommendation) {
      next(new ApiError("The given Base Recommendation to push to doesn't exist!", httpCodes.NOT_FOUND));
      return;
    }

    if (baseRecommendation.informativeRecommendations.includes(informativeRecommendation._id)) {
      next(
        new ApiError('The Base Recommendation already contains the Informative Recommendation!', httpCodes.NOT_FOUND)
      );
      return;
    }

    if (informativeRecommendation.baseRecommendations.includes(baseRecommendation._id)) {
      next(
        new ApiError(
          'The Informative Recommendation already contains the given Base Recommendation!',
          httpCodes.NOT_FOUND
        )
      );
      return;
    }

    const editedPushBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
      { _id: baseRecommendation._id },
      { $push: { informativeRecommendations: informativeRecommendation._id } }
    );

    if (!editedPushBaseRecommendation) {
      next(new ApiError('Failed to push informative recommendation to Base recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }

    const editedPushInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      { $push: { baseRecommendations: baseRecommendation._id } }
    );

    if (!editedPushInformativeRecommendation) {
      next(new ApiError('Failed to push Base recommendation to Informative recommendation!', httpCodes.INTERNAL_ERROR));
      return;
    }
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
  const userId = request.admin._id;
  const { informativeRecommendationId } = request.params;

  const informativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendationId,
    isDeleted: false,
  });
  if (!informativeRecommendation) {
    next(new ApiError('Informative Recommendation not found!', httpCodes.NOT_FOUND));
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

  const deletedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
    { _id: informativeRecommendation._id },
    {
      $set: {
        isDeleted: true,
        recommendationCards: [],
        baseRecommendations: [],
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

  // const deletedRecommendationCards = await RecommendationCard.updateMany(
  //   { recommendation: informativeRecommendation._id },
  //   {
  //     $set: {
  //       isDeleted: true,
  //       updatedBy: userId,
  //       updatedAt: new Date(Date.now()),
  //     },
  //   }
  // );
  // if (!deletedRecommendationCards) {
  //   next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
  //   return;
  // }

  response.status(httpCodes.OK).json({ success: true, data: { deletedInformativeRecommendation }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
