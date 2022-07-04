// Imports: core node modules.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Imports: local files.
const { InformativeRecommendation, BaseRecommendation, RecommendationCard } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, getMode } = require('../utils/functions');
const { httpCodes } = require('../configs');

/**
 * @description Get all informative recommendations.
 * @route       GET /api/informativerecommendations.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
    select: select ? filterValues(select, []) : 'name description thumbnail baseRecommendations isGeneric',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'baseRecommendations recommendationCards',
  };

  const query = InformativeRecommendation.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'recommendationcards',
        localField: 'recommendationCards',
        foreignField: '_id',
        as: 'recommendationCards',
      },
    },
    {
      $lookup: {
        from: 'baserecommendations',
        localField: 'baseRecommendations',
        foreignField: '_id',
        as: 'baseRecommendations',
      },
    },
    { $unwind: '$recommendationCards' },
    { $sort: { 'recommendationCards.order': 1 } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        description: { $first: '$description' },
        thumbnail: { $first: '$thumbnail' },
        isGeneric: { $first: '$isGeneric' },
        baseRecommendations: { $first: '$baseRecommendations' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);

  // const query = { isDeleted: false };
  // const informativeRecommendations = await InformativeRecommendation.paginate(query, options);
  const informativeRecommendations = await InformativeRecommendation.aggregatePaginate(query, options);

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

  const query = InformativeRecommendation.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(informativeRecommendationId), isDeleted: false } },
    {
      $lookup: {
        from: 'recommendationcards',
        localField: 'recommendationCards',
        foreignField: '_id',
        as: 'recommendationCards',
      },
    },
    {
      $lookup: {
        from: 'baserecommendations',
        localField: 'baseRecommendations',
        foreignField: '_id',
        as: 'baseRecommendations',
      },
    },
    { $unwind: '$recommendationCards' },
    { $sort: { 'recommendationCards.order': 1 } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        description: { $first: '$description' },
        thumbnail: { $first: '$thumbnail' },
        isGeneric: { $first: '$isGeneric' },
        baseRecommendations: { $first: '$baseRecommendations' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);
  const informativeRecommendation = await InformativeRecommendation.aggregatePaginate(query, { pagination: false });

  if (!informativeRecommendation && !informativeRecommendation.docs) {
    next(new ApiError('Base Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { informativeRecommendation: informativeRecommendation.docs[0] }, error: null });
  return;
});

/**
 * @description Create a informative recommendation.
 * @route       POST /api/informativerecommendations.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { name, description, isGeneric } = request.body;

  const baseRecommendationsId = request.body.baseRecommendationsId
    ? JSON.parse(request.body.baseRecommendationsId)
    : null;

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

  if (baseRecommendationsId) {
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
  }

  const latestUpdatedInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendation._id,
    isDeleted: false,
  });
  if (!latestUpdatedInformativeRecommendation) {
    next(new ApiError('Informative Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['thumbnail'];

  if (fileTypes.length !== 1) {
    await latestUpdatedInformativeRecommendation.remove();
    next(new ApiError('You must input the file Type!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      await latestUpdatedInformativeRecommendation.remove();
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(latestUpdatedInformativeRecommendation._id, userId, request, fileTypes);
  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await latestUpdatedInformativeRecommendation.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedLatestUpdatedInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: latestUpdatedInformativeRecommendation._id,
    isDeleted: false,
  });
  if (!updatedLatestUpdatedInformativeRecommendation) {
    next(new ApiError('Informative Recommendation after file upload not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.CREATED)
    .json({ success: true, data: { updatedLatestUpdatedInformativeRecommendation }, error: null });
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
  const { name, description, isGeneric, pullFromId, pushToId, toBeDeleted } = request.body;

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

  const latestUpdatedInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendation._id,
    isDeleted: false,
  });
  if (!latestUpdatedInformativeRecommendation) {
    next(new ApiError('Informative Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  // toBeDeleted array of values
  const availableValues = ['thumbnail'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) latestUpdatedInformativeRecommendation[value] = null;
    });

    await latestUpdatedInformativeRecommendation.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];
    const requiredTypes = ['thumbnail'];

    if (fileTypes.length !== 1) {
      next(new ApiError('You must input the required file Type!', httpCodes.BAD_REQUEST));
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
          latestUpdatedInformativeRecommendation[fileType] &&
          request.files[fileType].name === latestUpdatedInformativeRecommendation[fileType].name
        ) {
          next(new ApiError('Informative Recommendation file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(latestUpdatedInformativeRecommendation._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const editedFileInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: latestUpdatedInformativeRecommendation._id,
    isDeleted: false,
  }).populate('recommendationCards');
  if (!editedFileInformativeRecommendation) {
    next(new ApiError('Edited File RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { informativeRecommendation: editedFileInformativeRecommendation }, error: null });
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

// Helpers for this controller.
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

const uploadFile = async (informativeRecommendationId, userId, request, fileType) => {
  // if (!request.files[fileType]) {
  //   return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  // }

  // const allowedFileTypes = ['thumbnail'];

  // if (!allowedFileTypes.includes(fileType)) {
  //   return {
  //     success: false,
  //     data: null,
  //     error: `File Type ${fileType} must be of ${allowedFileTypes}`,
  //     code: httpCodes.BAD_REQUEST,
  //   };
  // }

  const { data, mimetype, name, size } = request.files[fileType];

  const type = mimetype.split('/').pop();

  let allowedTypes = ['jpeg', 'jpg', 'png'];

  if (!allowedTypes.includes(type)) {
    return { success: false, data: null, error: `Wrong ${fileType} type!`, code: httpCodes.BAD_REQUEST };
  }

  const informativeRecommendation = await InformativeRecommendation.findOne({ _id: informativeRecommendationId });
  if (!informativeRecommendation) {
    return {
      success: false,
      data: null,
      error: 'InformativeRecommendation not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  if (informativeRecommendation[fileType] && informativeRecommendation[fileType].name === name) {
    return {
      success: true,
      data: { updatedInformativeRecommendation: informativeRecommendation },
      error: null,
      code: null,
    };
  }

  const fileName = `${informativeRecommendation._id}_${fileType}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/informativerecommendations/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/informativerecommendations/${fileName}`;

  const updatedInformativeRecommendation = await InformativeRecommendation.findOneAndUpdate(
    { _id: informativeRecommendation._id },
    {
      $set: {
        [fileType]: {
          url: fileURL,
          name: name,
          mimetype: mimetype,
          size: size,
        },
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!updatedInformativeRecommendation) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedInformativeRecommendation }, error: null, code: null };
};

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
