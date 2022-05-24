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
const getOne = asyncHandler(async (request, response, next) => {
  const { recommendationCardId } = request.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: recommendationCardId, isDeleted: false })
    //.select('name description')
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

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];

    const requiredTypes = ['small', 'medium', 'large', 'thumbnail'];

    if (fileTypes.length !== 4) {
      next(new ApiError('You must input all 4 file Types!', httpCodes.BAD_REQUEST));
      return;
    }

    for (const fileType of fileTypes) {
      if (!requiredTypes.includes(fileType)) {
        next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
        return;
      }
    }

    const fileResults = await fileResult(recommendationCard._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const updatedRecommendationCard = await RecommendationCard.findOne({ _id: recommendationCard._id, isDeleted: false });

  if (!updatedRecommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  return response.status(200).json({ success: true, data: { updatedRecommendationCard }, error: null });
});

/**
 * @description Update a recommendationCard.
 * @route       PUT /api/recommendationcards/:recommendationCardId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { recommendationCardId } = request.params;
  const { name, description, recommendationId, toBeDeleted } = request.body;

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

  // toBeDeleted array of values
  const availableValues = ['small', 'medium', 'large', 'thumbnail'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) {
        editedRecommendationCard[value] = null;
      }
    });
    await editedRecommendationCard.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];

    const requiredTypes = ['small', 'medium', 'large', 'thumbnail'];

    if (fileTypes.length !== 4) {
      next(new ApiError('You must input all 4 file Types!', httpCodes.BAD_REQUEST));
      return;
    }

    for (const fileType of fileTypes) {
      if (!requiredTypes.includes(fileType)) {
        next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
        return;
      }
    }

    // Check if the file name is same in recommendation Card
    if (fileTypes) {
      for (const fileType of fileTypes) {
        if (
          editedRecommendationCard[fileType] &&
          request.files[fileType].name === editedRecommendationCard[fileType].name
        ) {
          next(new ApiError('RecommendationCard file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedRecommendationCard._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const editedFileRecommendationCard = await RecommendationCard.findOne({
    _id: editedRecommendationCard._id,
    isDeleted: false,
  });

  if (!editedFileRecommendationCard) {
    next(new ApiError('Edited File RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { recommendationCard: editedFileRecommendationCard }, error: null });
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

async function fileResult(recommendationCard, userId, req, fileTypes) {
  if (req.files && Object.keys(req.files).length) {
    const resultObj = {};

    for (const fileType of fileTypes) {
      resultObj[`${fileType}Result`] = null;
    }

    for (const fileType of fileTypes) {
      if (req.files[fileType]) {
        const fileUploadResult = await uploadFile(recommendationCard, userId, req, fileType);
        resultObj[`${fileType}Result`] = fileUploadResult;
      }
    }

    return resultObj;
  }
}

const uploadFile = async (recommendationCardId, userId, request, fileType) => {
  if (!request.files[fileType]) {
    return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  }

  const allowedFileTypes = ['small', 'medium', 'large', 'thumbnail'];

  if (!allowedFileTypes.includes(fileType)) {
    return {
      success: false,
      data: null,
      error: `File Type ${fileType} must be of ${allowedFileTypes}`,
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

  return { success: true, data: { updatedRecommendationCard }, error: null, code: null };
};

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
