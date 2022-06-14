// Imports: local files.
const { BaseRecommendation, RecommendationCard, InformativeRecommendation } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, checkValidValues } = require('../utils/functions');
const { httpCodes, staticValues } = require('../configs');

/**
 * @description Get all base recommendations.
 * @route       GET /api/baserecommendations.
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
  const baseRecommendations = await BaseRecommendation.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { baseRecommendations }, error: null });
  return;
});

/**
 * @description Get base recommandation by id.
 * @route       GET /api/baserecommendations/:baseRecommendationId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { baseRecommendationId } = request.params;

  const baseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendationId, isDeleted: false });
  if (!baseRecommendation) {
    next(new ApiError('Base Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { baseRecommendation }, error: null });
  return;
});

/**
 * @description Create a base recommendation.
 * @route       POST /api/baserecommendations.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';

  const {
    name,
    description,
    aqi,
    age,
    airQuality,
    gender,
    isPregnant,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
  } = request.body;

  const baseRecommendationExists = (await BaseRecommendation.countDocuments({ name, isDeleted: false })) > 0;
  if (baseRecommendationExists) {
    next(new ApiError('Base Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  if (isPregnant && !gender.includes('Femër')) {
    next(
      new ApiError(
        "You cannot create a base recommendation where is pregnant is equal to true and gender doesn't incude female!",
        httpCodes.BAD_REQUEST
      )
    );
    return;
  }

  if (airQuality && !staticValues.airQuality.includes(airQuality)) {
    next(
      new ApiError(
        `The value of ${airQuality} is not in allowed values : ${staticValues.airQuality} !`,
        httpCodes.BAD_REQUEST
      )
    );
    return;
  }

  const types = ['age', 'gender', 'haveDiseaseDiagnosis', 'energySource', 'hasChildrenDisease'];

  for (const type of types) {
    if (request.body[type]) {
      const result = checkValidValues(type, request.body[type]);
      if (result && result.error) {
        next(new ApiError(result.error, result.code));
        return;
      }
    }
  }

  const payload = {
    name,
    description,
    aqi,
    age,
    gender,
    airQuality,
    haveDiseaseDiagnosis,
    energySource,
    isPregnant,
    hasChildren,
    hasChildrenDisease,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const baseRecommendation = await BaseRecommendation.create(payload);
  if (!baseRecommendation) {
    next(new ApiError('Failed to create new base recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { baseRecommendation }, error: null });
  return;
});

/**
 * @description Update a recommendation.
 * @route       PUT /api/recommendations/:baseRecommendationId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';
  const { baseRecommendationId } = request.params;
  const {
    name,
    description,
    aqi,
    age,
    type,
    gender,
    isPregnant,
    airQuality,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
  } = request.body;

  const baseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendationId, isDeleted: false });
  if (!baseRecommendation) {
    next(new ApiError('Base Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    description,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    age,
    type,
    gender,
    airQuality,
    isPregnant,
    hasChildren,
    hasChildrenDisease,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };

  if (isPregnant && !gender.includes('Femër')) {
    next(
      new ApiError(
        "You cannot create a base recommendation where is pregnant is equal to true and gender doesn't incude female!",
        httpCodes.BAD_REQUEST
      )
    );
    return;
  }

  if (!hasChildren && hasChildrenDisease && hasChildrenDisease.length > 0) {
    next(
      new ApiError(
        'You cannot create a base recommendation where it has children disease and has no children!',
        httpCodes.BAD_REQUEST
      )
    );
    return;
  }

  if (airQuality && !staticValues.airQuality.includes(airQuality)) {
    next(
      new ApiError(
        `The value of ${airQuality} is not in allowed values : ${staticValues.airQuality} !`,
        httpCodes.BAD_REQUEST
      )
    );
    return;
  }

  const types = ['age', 'gender', 'haveDiseaseDiagnosis', 'energySource', 'hasChildrenDisease'];

  for (const type of types) {
    if (request.body[type]) {
      const result = checkValidValues(type, request.body[type]);
      if (result && result.error) {
        next(new ApiError(result.error, result.code));
        return;
      }
    }
  }

  const editedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
    { _id: baseRecommendation._id },
    { $set: payload },
    { new: true }
  );

  if (!editedBaseRecommendation) {
    next(new ApiError('Failed to update base recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation: editedBaseRecommendation }, error: null });
  return;
});

/**
 * @description Delete a base recommendation.
 * @route       DELETE /api/baserecommendations/:baseRecommendationId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  // const userId = request.admin._id;
  const userId = '62a6f9ccc6d0625cae95a0c8';
  const { baseRecommendationId } = request.params;

  const baseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendationId, isDeleted: false });
  if (!baseRecommendation) {
    next(new ApiError('Base Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  for (const informativeRecommendation of baseRecommendation.informativeRecommendations) {
    const updatedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
      { _id: informativeRecommendation._id },
      { $pull: { baseRecommendations: baseRecommendation._id } }
    );
    if (!updatedInformativeRecommendation) {
      next(
        new ApiError('Failed to pull base recommendation from informative recommendation!', httpCodes.INTERNAL_ERROR)
      );
      return;
    }
  }

  const deletedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
    { _id: baseRecommendation._id },
    {
      $set: {
        isDeleted: true,
        recommendationCards: [],
        informativeRecommendations: [],
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedBaseRecommendation) {
    next(new ApiError('Failed to delete base recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const deletedBaseRecommendationCards = await RecommendationCard.updateMany(
    { recommendation: baseRecommendation._id },
    {
      $set: {
        isDeleted: true,
        recommendation: null,
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    }
  );
  if (!deletedBaseRecommendationCards) {
    next(new ApiError('Failed to delete the recommendation cards!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation: deletedBaseRecommendation }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
