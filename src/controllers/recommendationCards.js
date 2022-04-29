// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: local files.
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
 * @route       POST /api/recommendationcards.
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

  let smallResult = null;
  let mediumResult = null;
  let largeResult = null;
  let thumbnailResult = null;

  if (request.files && Object.keys(request.files).length && request.files['small']) {
    smallResult = await uploadFile(recommendationCard._id, userId, request, 'small');
    if (!smallResult.success) {
      next(new ApiError(smallResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  if (request.files && Object.keys(request.files).length && request.files['medium']) {
    mediumResult = await uploadFile(recommendationCard._id, userId, request, 'medium');
    if (!mediumResult.success) {
      next(new ApiError(mediumResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  if (request.files && Object.keys(request.files).length && request.files['large']) {
    largeResult = await uploadFile(recommendationCard._id, userId, request, 'large');
    if (!largeResult.success) {
      next(new ApiError(largeResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  if (request.files && Object.keys(request.files).length && request.files['thumbnail']) {
    thumbnailResult = await uploadFile(recommendationCard._id, userId, request, 'thumbnail');
    if (!thumbnailResult.success) {
      next(new ApiError(thumbnailResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  // let updatedRecommendationCard = attachFileResultToRecommendationCard(
  //   smallResult,
  //   mediumResult,
  //   largeResult,
  //   thumbnailResult,
  //   recommendationCard
  // );

  const updatedRecommendationCard =
    (smallResult && smallResult.success) ||
    (mediumResult && mediumResult.success) ||
    (largeResult && largeResult.success) ||
    (thumbnailResult && thumbnailResult.success)
      ? await RecommendationCard.findOne({ _id: recommendationCard._id })
      : {};

  return response.status(httpCodes.CREATED).json({
    success: true,
    //data: { updatedRecommendation, updatedRecommendationCard },
    data: { updatedRecommendation, updatedRecommendationCard },
    error: null,
  });
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

const attachFileResultToRecommendationCard = (
  smallResult,
  mediumResult,
  largeResult,
  thumbnailResult,
  recommendationCard
) => {
  let updatedRecommendationCard = null;

  if (smallResult && smallResult.success) {
    updatedRecommendationCard =
      smallResult && smallResult.success && smallResult.data
        ? smallResult.data.updatedRecommendationCard
        : recommendationCard;
  } else if (mediumResult && mediumResult.success) {
    updatedRecommendationCard =
      mediumResult && mediumResult.success && mediumResult.data
        ? mediumResult.data.updatedRecommendationCard
        : recommendationCard;
  } else if (largeResult && largeResult.success) {
    updatedRecommendationCard =
      largeResult && largeResult.success && largeResult.data
        ? largeResult.data.updatedRecommendationCard
        : recommendationCard;
  } else if (thumbnailResult && thumbnailResult.success) {
    updatedRecommendationCard =
      thumbnailResult && thumbnailResult.success && thumbnailResult.data
        ? thumbnailResult.data.updatedRecommendationCard
        : recommendationCard;
  } else {
    updatedRecommendationCard = recommendationCard;
  }

  return updatedRecommendationCard;
};

const uploadFile = async (recommendationCardId, userId, request, fileType) => {
  if (!request.files[fileType]) {
    return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  }

  const allowedFileTypes = ['small', 'medium', 'large', 'thumbnail'];

  if (!allowedFileTypes.includes(fileType)) {
    return {
      success: false,
      data: null,
      error: `File Type must be of ${allowedFileTypes}`,
      code: httpCodes.BAD_REQUEST,
    };
  }

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

  // const publicURL = isMode('production') ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const publicURL = 'http://localhost:5000';
  const fileURL = `${publicURL}/recommendationcards/${fileName}`;

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
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!updatedRecommendationCard) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  console.log(updatedRecommendationCard);

  return { success: true, data: { updatedRecommendationCard }, error: null, code: null };
};

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
