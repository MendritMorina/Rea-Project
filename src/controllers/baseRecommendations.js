// Imports: core node modules.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Imports: local files.
const { BaseRecommendation, RecommendationCard, InformativeRecommendation } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, checkValidValues, getMode } = require('../utils/functions');
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
      ? filterValues(select, [])
      : 'name description thumbnail airQuality gender age haveDiseaseDiagnosis energySource isPregnant hasChildren hasChildrenDisease',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'informativeRecommendations recommendationCards',
  };

  const query = {};
  if (request.query.name) query['name'] = { $regex: request.query.name, $options: 'i' };

  const baseAggregate = BaseRecommendation.aggregate([
    { $match: { isDeleted: false, ...query } },
    {
      $lookup: {
        from: 'recommendationcards',
        localField: 'recommendationCards',
        foreignField: '_id',
        as: 'recommendationCards',
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
        airQuality: { $first: '$airQuality' },
        gender: { $first: '$gender' },
        age: { $first: '$age' },
        // energySource: { $first: '$energySource' },
        haveDiseaseDiagnosis: { $first: '$haveDiseaseDiagnosis' },
        isPregnant: { $first: '$isPregnant' },
        // hasChildren: { $first: '$hasChildren' },
        // hasChildrenDisease: { $first: '$hasChildrenDisease' },
        informativeRecommendations: { $first: '$informativeRecommendations' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);

  const baseRecommendations = await BaseRecommendation.aggregatePaginate(baseAggregate, options);

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

  const query = BaseRecommendation.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(baseRecommendationId), isDeleted: false } },
    {
      $lookup: {
        from: 'recommendationcards',
        localField: 'recommendationCards',
        foreignField: '_id',
        as: 'recommendationCards',
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
        airQuality: { $first: '$airQuality' },
        gender: { $first: '$gender' },
        age: { $first: '$age' },
        // energySource: { $first: '$energySource' },
        haveDiseaseDiagnosis: { $first: '$haveDiseaseDiagnosis' },
        isPregnant: { $first: '$isPregnant' },
        // hasChildren: { $first: '$hasChildren' },
        // hasChildrenDisease: { $first: '$hasChildrenDisease' },
        informativeRecommendations: { $first: '$informativeRecommendations' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);
  const baseRecommendation = await BaseRecommendation.aggregatePaginate(query, { pagination: false });

  if (!baseRecommendation && !baseRecommendation.docs) {
    next(new ApiError('Base Recommendation with given id not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation: baseRecommendation.docs[0] }, error: null });
  return;
});

/**
 * @description Create a base recommendation.
 * @route       POST /api/baserecommendations.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;

  const { name, description, airQuality, isPregnant } = request.body;

  const age = JSON.parse(request.body.age);
  const gender = JSON.parse(request.body.gender);
  const haveDiseaseDiagnosis = JSON.parse(request.body.haveDiseaseDiagnosis);

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

  const types = ['age', 'gender', 'haveDiseaseDiagnosis'];

  for (const type of types) {
    if (request.body[type]) {
      const result = checkValidValues(type, JSON.parse(request.body[type]));
      if (result && result.error) {
        next(new ApiError(result.error, result.code));
        return;
      }
    }
  }

  const payload = {
    name,
    description,
    age,
    gender,
    airQuality,
    haveDiseaseDiagnosis,
    isPregnant,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const baseRecommendation = await BaseRecommendation.create(payload);
  if (!baseRecommendation) {
    next(new ApiError('Failed to create new base recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['thumbnail'];

  if (fileTypes.length !== 1) {
    await baseRecommendation.remove();
    next(new ApiError('You must input the required file Type!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      await baseRecommendation.remove();
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(baseRecommendation._id, userId, request, fileTypes);
  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await baseRecommendation.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedBaseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendation._id, isDeleted: false });
  if (!updatedBaseRecommendation) {
    next(new ApiError('Base Recommendation after file upload not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(200).json({ success: true, data: { updatedBaseRecommendation }, error: null });
  return;
});

/**
 * @description Update a base recommendation.
 * @route       PUT /api/baserecommendations/:baseRecommendationId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { baseRecommendationId } = request.params;
  const { name, description, isPregnant, airQuality, toBeDeleted } = request.body;

  const age = JSON.parse(request.body.age);
  const gender = JSON.parse(request.body.gender);
  const haveDiseaseDiagnosis = JSON.parse(request.body.haveDiseaseDiagnosis);

  const baseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendationId, isDeleted: false });
  if (!baseRecommendation) {
    next(new ApiError('Base Recommendation not found!', httpCodes.NOT_FOUND));
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

  const types = ['age', 'gender', 'haveDiseaseDiagnosis'];

  for (const type of types) {
    if (JSON.parse(request.body[type])) {
      const result = checkValidValues(type, JSON.parse(request.body[type]));
      if (result && result.error) {
        next(new ApiError(result.error, result.code));
        return;
      }
    }
  }

  const payload = {
    name,
    description,
    haveDiseaseDiagnosis,
    age,
    gender,
    airQuality,
    isPregnant,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };

  const editedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
    { _id: baseRecommendation._id },
    { $set: payload },
    { new: true }
  );

  if (!editedBaseRecommendation) {
    next(new ApiError('Failed to update base recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  // toBeDeleted array of values
  const availableValues = ['thumbnail'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) editedBaseRecommendation[value] = null;
    });

    await editedBaseRecommendation.save();
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
          editedBaseRecommendation[fileType] &&
          request.files[fileType].name === editedBaseRecommendation[fileType].name
        ) {
          next(new ApiError('BaseRecommendation file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedBaseRecommendation._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const editedFileBaseRecommendation = await BaseRecommendation.findOne({
    _id: editedBaseRecommendation._id,
    isDeleted: false,
  }).populate('recommendationCards');
  if (!editedFileBaseRecommendation) {
    next(new ApiError('Edited File RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation: editedFileBaseRecommendation }, error: null });
  return;
});

/**
 * @description Delete a base recommendation.
 * @route       DELETE /api/baserecommendations/:baseRecommendationId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
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

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { baseRecommendation: deletedBaseRecommendation }, error: null });
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

const uploadFile = async (baseRecommendationId, userId, request, fileType) => {
  const { data, mimetype, name, size } = request.files[fileType];

  const type = mimetype.split('/').pop();

  let allowedTypes = ['jpeg', 'jpg', 'png'];

  if (!allowedTypes.includes(type)) {
    return { success: false, data: null, error: `Wrong ${fileType} type!`, code: httpCodes.BAD_REQUEST };
  }

  const baseRecommendation = await BaseRecommendation.findOne({ _id: baseRecommendationId });
  if (!baseRecommendation) {
    return {
      success: false,
      data: null,
      error: 'BaseRecommendation not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  if (baseRecommendation[fileType] && baseRecommendation[fileType].name === name) {
    return { success: true, data: { updatedBaseRecommendation: baseRecommendation }, error: null, code: null };
  }

  const fileName = `${baseRecommendation._id}_${fileType}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/baserecommendations/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/baserecommendations/${fileName}`;

  const updatedBaseRecommendation = await BaseRecommendation.findOneAndUpdate(
    { _id: baseRecommendation._id },
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
  if (!updatedBaseRecommendation) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedBaseRecommendation }, error: null, code: null };
};

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
