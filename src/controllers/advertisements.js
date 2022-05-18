// Imports: core node modules.
const fs = require('fs');
const path = require('path');

//const Advertisement = require('../models');
const Advertisement = require('../models/Advertisement');

const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { filterValues } = require('../utils/functions');

const { httpCodes } = require('../configs');

/**
 * @description Get all advertisements.
 * @route       GET /api/advertisements.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, select, sort } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select ? filterValues(select, []) : 'name description',
    sort: sort ? request.query.sort.split(',').join(' ') : 'name',
  };

  const query = {
    isDeleted: false,
  };

  const advertisements = await Advertisement.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { advertisements }, error: null });
});

/**
 * @description Get advertisement by id.
 * @route       GET /api/advertisements/:advertisementId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { advertisementId } = request.params;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false }).select(
    'name description photo thumbnail'
  );

  if (!advertisement) {
    next(new ApiError('Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { advertisement }, error: null });
});

/**
 * @description Get random advertisement by priority.
 * @route       GET /api/advertisements/randomAdvertisement.
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

  // randomAdvertisement.viewCounter += 1;
  // const savedrandomAdvertisement = await randomAdvertisement.save();

  const updatedRandomAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: randomAdvertisement._id },
    { $inc: { viewCounter: 1 } },
    { new: true }
  );

  if (!updatedRandomAdvertisement) {
    next(new ApiError('Random Advertisement view count failed to increment!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { updatedRandomAdvertisement }, error: null });
});

// const getRandomOne = asyncHandler(async (request, response, next) => {
//   const probability = 0.9;

//   const randPriorityVal = randomValueBasedPriority(probability);

//   const advertisements = await Advertisement.find({ isDeleted: false, priority: randPriorityVal });

//   while (!advertisements) {
//     randPriorityVal = randomValueBasedPriority(probability);
//     advertisements = await Advertisement.find({ isDeleted: false, priority: randPriorityVal });
//   }

//   const randomIndex = parseInt(Math.random() * advertisements.length);

//   const randomAdvertisement = advertisements[randomIndex];

//   response.status(httpCodes.OK).json({ success: true, data: { randomAdvertisement }, error: null });
// });

/**
 * @description Create random advertisements (This is used just for testing)
 * @route       POST /api/advertisements/randomAdvertisements/:numberOfAdvertisements.
 * @access      Public.
 */
const createRandomAdvertisements = asyncHandler(async (request, response, next) => {
  const nrOfAdv = request.params.numberOfAdvertisements;
  const { nameLength, descriptionLength } = request.body;

  const advertisements = [];

  for (let i = 0; i < nrOfAdv; i++) {
    const payload = {
      name: randomString(nameLength),
      description: randomString(descriptionLength),
      priority: parseInt(1 + Math.random() * 20, 10),
    };

    const createdAdvertisement = await Advertisement.create(payload);
    advertisements.push(createdAdvertisement);
  }

  response.status(httpCodes.OK).json({ success: true, data: { advertisements }, error: null });
});

function randomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result = result + characters.charAt(parseInt(Math.random() * charactersLength, 10));
  }

  return result;
}

/**
 * @description Create a advertisement.
 * @route       POST /api/advertisements.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { name, description, priority, webLink, iosLink, androidLink } = request.body;

  const advertisementExists = (await Advertisement.countDocuments({ name, isDeleted: false })) > 0;
  if (advertisementExists) {
    next(new ApiError('Advertisement with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

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

  response.status(httpCodes.CREATED).json({ success: true, data: { latestUpdateAdvertisement }, error: null });
});

/**
 * @description Update a advertisement.
 * @route       PUT /api/advertisements/:advertisementId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { advertisementId } = request.params;
  const { name, description, priority, webLink, iosLink, androidLink, toBeDeleted } = request.body;

  const advertisement = await Advertisement.findOne({ _id: advertisementId, isDeleted: false });
  if (!advertisement) {
    next(new ApiError('Advertisement not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== advertisement.name) {
    const advertisementExists =
      (await Advertisement.countDocuments({ _id: { $ne: advertisement._id }, name, isDeleted: false })) > 0;
    if (advertisementExists) {
      next(new ApiError('Advertisement with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    description,
    priority,
    webLink,
    iosLink,
    androidLink,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };

  const editedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisement._id },
    {
      $set: payload,
    },
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
});

/**
 * @description Delete a advertisement.
 * @route       DELETE /api/advertisements/:advertisementId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
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
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
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
 * @route       POST /api/advertisements/clickAdvertisement.
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

  // advertisement[type] += 1;
  // const clickedAdvertisement = await advertisement.save();

  const clickedAdvertisement = await Advertisement.findOneAndUpdate(
    { _id: advertisement._id },
    {
      $inc: { [type]: 1 },
    },
    { new: true }
  );

  response.status(httpCodes.OK).json({ success: true, data: { advertisement: clickedAdvertisement }, error: null });
});

// Returns a random number from 1 to 20 with high probability of being larger
function randomValueBasedPriority(probability) {
  const randomvalue = Math.random();
  let priorityIndex = parseInt(1 + Math.random() * 20, 10);
  if (randomvalue < probability) {
    priorityIndex = priorityIndex + parseInt(10 + Math.random() * 10, 10);
    if (10 <= priorityIndex && priorityIndex <= 15) {
      const randInt = parseInt(Math.random() * 5, 10);
      priorityIndex += randInt;
      while (priorityIndex > 20) {
        priorityIndex -= 1;
      }
      return priorityIndex;
    } else if (15 <= priorityIndex && priorityIndex <= 20) {
      return priorityIndex;
    } else {
      while (priorityIndex > 20) {
        priorityIndex -= 1;
      }

      return priorityIndex;
    }
  } else {
    //priorityIndex = priorityIndex + parseInt(Math.random() * 10, 10);
    while (priorityIndex > 20) {
      priorityIndex -= 1;
    }
    return priorityIndex;
  }
}

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

  // const publicURL = isMode('production') ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const publicURL = 'http://localhost:5000';
  const fileURL = `${publicURL}/advertisements/${fileName}`;

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
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
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
  createRandomAdvertisements,
  clickAdvertisement,
};
