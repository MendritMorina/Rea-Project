// Imports: core node modules.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Imports: local files.
const { InformativeRecommendation, BaseRecommendation, RecommendationCard } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, getMode, checkValidValues } = require('../utils/functions');
const { httpCodes, staticValues } = require('../configs');

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
    select: select ? filterValues(select, []) : 'name description thumbnail isGeneric',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendationCards',
  };

  const query = {};
  if (request.query.name) query['name'] = { $regex: request.query.name, $options: 'i' };

  const informativeAggregate = InformativeRecommendation.aggregate([
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
        isGeneric: { $first: '$isGeneric' },
        energySource: { $first: '$energySource' },
        haveDiseaseDiagnosis: { $first: '$haveDiseaseDiagnosis' },
        isPregnant: { $first: '$isPregnant' },
        hasChildren: { $first: '$hasChildren' },
        hasChildrenDisease: { $first: '$hasChildrenDisease' },
        informativeRecommendations: { $first: '$informativeRecommendations' },
        createdAt: { $first: '$createdAt' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);

  const informativeRecommendations = await InformativeRecommendation.aggregatePaginate(informativeAggregate, options);

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
        isGeneric: { $first: '$isGeneric' },
        energySource: { $first: '$energySource' },
        haveDiseaseDiagnosis: { $first: '$haveDiseaseDiagnosis' },
        isPregnant: { $first: '$isPregnant' },
        hasChildren: { $first: '$hasChildren' },
        hasChildrenDisease: { $first: '$hasChildrenDisease' },
        informativeRecommendations: { $first: '$informativeRecommendations' },
        createdAt: { $first: '$createdAt' },
        recommendationCards: { $push: '$recommendationCards' },
      },
    },
  ]);
  const informativeRecommendation = await InformativeRecommendation.aggregatePaginate(query, { pagination: false });

  if (!informativeRecommendation && !informativeRecommendation.docs) {
    next(new ApiError('Recommendation with given id not found!', httpCodes.NOT_FOUND));
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

  const { name, description, airQuality, isGeneric, isPregnant, hasChildren } = request.body;

  const age = JSON.parse(request.body.age);
  const gender = JSON.parse(request.body.gender);
  const haveDiseaseDiagnosis = JSON.parse(request.body.haveDiseaseDiagnosis);
  const energySource = JSON.parse(request.body.energySource);
  const hasChildrenDisease = JSON.parse(request.body.hasChildrenDisease);

  const informativeRecommendationExists =
    (await InformativeRecommendation.countDocuments({ name, isDeleted: false })) > 0;
  if (informativeRecommendationExists) {
    next(new ApiError('Informative Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  if (isPregnant && !gender.includes('Femër')) {
    next(
      new ApiError(
        "You cannot create a informative recommendation where is pregnant is equal to true and gender doesn't incude female!",
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
    isGeneric,
    energySource,
    isPregnant,
    hasChildren,
    hasChildrenDisease,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };

  const informativeRecommendation = await InformativeRecommendation.create(payload);
  if (!informativeRecommendation) {
    next(new ApiError('Failed to create new informative recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['thumbnail'];

  if (fileTypes.length !== 1) {
    await informativeRecommendation.remove();
    next(new ApiError('You must input the required file Type!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      await informativeRecommendation.remove();
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(informativeRecommendation._id, userId, request, fileTypes);
  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await informativeRecommendation.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendation._id,
    isDeleted: false,
  });
  if (!updatedInformativeRecommendation) {
    next(new ApiError('Informative Recommendation after file upload not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { updatedInformativeRecommendation }, error: null });
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
  const { name, description, isPregnant, isGeneric, airQuality, hasChildren, toBeDeleted } = request.body;

  const age = JSON.parse(request.body.age);
  const gender = JSON.parse(request.body.gender);
  const haveDiseaseDiagnosis = JSON.parse(request.body.haveDiseaseDiagnosis);
  const energySource = JSON.parse(request.body.energySource);
  const hasChildrenDisease = JSON.parse(request.body.hasChildrenDisease);

  const informativeRecommendation = await InformativeRecommendation.findOne({
    _id: informativeRecommendationId,
    isDeleted: false,
  });
  if (!informativeRecommendation) {
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

  const types = ['age', 'gender', 'haveDiseaseDiagnosis', 'energySource', 'hasChildrenDisease'];

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
    haveDiseaseDiagnosis,
    age,
    gender,
    airQuality,
    isPregnant,
    isGeneric,
    energySource,
    hasChildren,
    hasChildrenDisease,
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

  // toBeDeleted array of values
  const availableValues = ['thumbnail'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) editedInformativeRecommendation[value] = null;
    });

    await editedInformativeRecommendation.save();
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
          editedInformativeRecommendation[fileType] &&
          request.files[fileType].name === editedInformativeRecommendation[fileType].name
        ) {
          next(new ApiError('InformativeRecommendation file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedInformativeRecommendation._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const editedFileInformativeRecommendation = await InformativeRecommendation.findOne({
    _id: editedInformativeRecommendation._id,
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
  const fileURL = `${publicURL}/public/informativerecommendations/${fileName}`;

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
