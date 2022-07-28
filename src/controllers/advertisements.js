// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: local files.
const { Advertisement } = require('../models');
const { asyncHandler } = require('../middlewares');
const { ApiError } = require('../utils/classes');
const { filterValues, getMode } = require('../utils/functions');
const { httpCodes } = require('../configs');

/**
 * @description Get all advertisements.
 * @route       GET /api/advertisements.
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
  };

  const query = { isDeleted: false };
  const advertisements = await Advertisement.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { advertisements }, error: null });
  return;
});

/**
 * @description Get advertisement by id.
 * @route       GET /api/advertisements/:advertisementId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { advertisementId } = request.params;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false });
  if (!advertisement) {
    next(new ApiError('Advertisement with given ide not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { advertisement }, error: null });
  return;
});

/**
 * @description Get random advertisement by priority.
 * @route       GET /api/advertisements/random.
 * @access      Public.
 */
const getRandomOne = asyncHandler(async (request, response, next) => {
  const temp = [];
  const advertisements = await Advertisement.find({ isDeleted: false });
  for (const advertisement of advertisements) {
    for (let i = 0; i < advertisement.priority; i++) {
      temp.push(advertisement);
    }
  }

  const randomAdvertisement = temp[parseInt(Math.random() * temp.length, 10)];
  if (!randomAdvertisement) {
    next(new ApiError('Random Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  const updatedRandomAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: randomAdvertisement._id },
    { $inc: { viewCounter: 1 } },
    { new: true }
  );
  if (!updatedRandomAdvertisement) {
    next(new ApiError('Failed to increment view count of advertisement!', httpCodes.NOT_FOUND));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { advertisement: updatedRandomAdvertisement }, error: null });
  return;
});

/**
 * @description Create an advertisement.
 * @route       POST /api/advertisements.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { name, description, priority, webLink, iosLink, androidLink } = request.body;

  const payload = {
    name,
    description,
    priority,
    webLink,
    iosLink,
    androidLink,
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };
  const advertisement = await Advertisement.create(payload);
  if (!advertisement) {
    next(new ApiError('Failed to create new advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['photo', 'thumbnail'];

  if (fileTypes.length !== 2) {
    await advertisement.remove(); // remove advertisement if the file upload failed, bacause it creates the advertisement without file
    next(new ApiError('You must input all 2 file Types!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      await advertisement.remove();
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(advertisement._id, userId, request, fileTypes);
  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await advertisement.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const latestUpdateAdvertisement = await Advertisement.findOne({ _id: advertisement._id });
  if (!latestUpdateAdvertisement) {
    next(new ApiError('Failed to get the latest advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.CREATED)
    .json({ success: true, data: { advertisement: latestUpdateAdvertisement }, error: null });
  return;
});

/**
 * @description Update a advertisement.
 * @route       PUT /api/advertisements/:advertisementId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { advertisementId } = request.params;
  const { name, description, priority, webLink, iosLink, androidLink, toBeDeleted } = request.body;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false });
  if (!advertisement) {
    next(new ApiError('Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    description,
    priority,
    webLink,
    iosLink,
    androidLink,
    updatedBy: userId,
    updatedAt: new Date(Date.now()),
  };
  const editedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisement._id },
    { $set: payload },
    { new: true }
  );
  if (!editedAdvertisement) {
    next(new ApiError('Failed to update advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  // toBeDeleted array of values
  const availableValues = ['photo', 'thumbnail'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) {
        editedAdvertisement[value] = null;
      }
    });
    await editedAdvertisement.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];
    const requiredTypes = ['photo', 'thumbnail'];

    // if (fileTypes.length !== 2) {
    //   next(new ApiError('You must input all 2 file Types!', httpCodes.BAD_REQUEST));
    //   return;
    // }

    for (const fileType of fileTypes) {
      if (!requiredTypes.includes(fileType)) {
        next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
        return;
      }
    }

    // Check if the file name is same in Advertisement
    if (fileTypes) {
      for (const fileType of fileTypes) {
        if (editedAdvertisement[fileType] && request.files[fileType].name === editedAdvertisement[fileType].name) {
          next(new ApiError('Advertisement file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedAdvertisement._id, userId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const latestUpdateAdvertisement = await Advertisement.findOne({ _id: editedAdvertisement._id });
  if (!latestUpdateAdvertisement) {
    next(new ApiError('Failed to get the latest advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response
    .status(httpCodes.OK)
    .json({ success: true, data: { advertisement: latestUpdateAdvertisement }, error: null });
  return;
});

/**
 * @description Delete a advertisement.
 * @route       DELETE /api/advertisements/:advertisementId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = request.admin._id;
  const { advertisementId } = request.params;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false });
  if (!advertisement) {
    next(new ApiError('Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisementId },
    {
      $set: {
        isDeleted: true,
        updatedBy: userId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedAdvertisement) {
    next(new ApiError('Failed to delete advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { advertisement: deletedAdvertisement }, error: null });
});

/**
 * @description Click a advertisement.
 * @route       POST /api/advertisements/click.
 * @access      Public.
 */
const clickAdvertisement = asyncHandler(async (request, response, next) => {
  const { advertisementId, type } = request.body;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false });
  if (!advertisement) {
    next(new ApiError('Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  const allowedTypes = ['photoClickCounter', 'thumbnailClickCounter'];
  if (!allowedTypes.includes(type)) {
    next(new ApiError(`This type ${type} is not allowed, it must be ${allowedTypes}`, httpCodes.BAD_REQUEST));
    return;
  }

  const clickedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisement._id },
    { $inc: { [type]: 1 } },
    { new: true }
  );
  if (!clickedAdvertisement) {
    next(new ApiError('Failed to count click on advertisement!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { advertisement: clickedAdvertisement }, error: null });
  return;
});

async function fileResult(advertisement, userId, req, fileTypes) {
  if (req.files && Object.keys(req.files).length) {
    const resultObj = {};

    for (const fileType of fileTypes) {
      resultObj[`${fileType}Result`] = null;
    }

    for (const fileType of fileTypes) {
      if (req.files[fileType]) {
        const fileUploadResult = await uploadFile(advertisement, userId, req, fileType);
        resultObj[`${fileType}Result`] = fileUploadResult;
      }
    }

    return resultObj;
  }
}

const uploadFile = async (advertisementId, userId, request, fileType) => {
  if (!request.files[fileType]) {
    return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  }

  const allowedFileTypes = ['photo', 'thumbnail'];

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

  const advertisement = await Advertisement.findOne({ _id: advertisementId });
  if (!advertisement) {
    return {
      success: false,
      data: null,
      error: 'Advertisement not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  if (advertisement[fileType] && advertisement[fileType].name === name) {
    return { success: true, data: { updatedAdvertisement: advertisement }, error: null, code: null };
  }

  const fileName = `${advertisement._id}_${fileType}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/advertisements/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/public/advertisements/${fileName}`;

  const updatedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisement._id },
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
  if (!updatedAdvertisement) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedAdvertisement }, error: null, code: null };
};

// Exports of this file.
module.exports = {
  getAll,
  getOne,
  create,
  deleteOne,
  updateOne,
  getRandomOne,
  clickAdvertisement,
};
