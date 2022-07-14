// Imports: core node modules.
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

// Imports: local files.
const { Story } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { getMode } = require('../utils/functions');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all stories for AdminPanel.
 * @route       GET /api/stories/admin.
 * @access      Public
 */
const getAllAdmin = asyncHandler(async (request, response) => {
  const { page, limit, pagination, category } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
  };

  const query = { isDeleted: false };
  if (category) query['category'] = category;
  const stories = await Story.paginate(query, options);

  response.status(200).json({ success: true, data: { stories }, error: null });
  return;
});

/**
 * @description Get all stories for Mobile.
 * @route       GET /api/stories/mobile.
 * @access      Public
 */
const getAllMobile = asyncHandler(async (request, response) => {
  const user = request.user;
  const { page, limit, pagination, category } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
  };

  const isSubscribed = user.currentSubscription && user.currentSubscription.isActive;
  if (!isSubscribed) options['select'] = '-audio';

  const query = { isDeleted: false };
  if (category) query['category'] = category;
  const stories = await Story.paginate(query, options);

  response.status(200).json({ success: true, data: { stories }, error: null });
  return;
});

/**
 * @description Get story by id.
 * @route       GET /api/stories/:storyId.
 * @access      Public.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { storyId } = request.params;

  const story = await Story.findOne({ _id: storyId, isDeleted: false });
  if (!story) {
    next(new ApiError('Story not found!', httpCodes.NOT_FOUND));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { story }, error: null });
  return;
});

/**
 * @description Create a story.
 * @route       POST /api/stories.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { name, title, description, authorName, authorSurname, narratorName, narratorSurname, category } = request.body;

  const payload = {
    name,
    title,
    description,
    authorName,
    authorSurname,
    narratorName,
    narratorSurname,
    category,
    createdBy: adminId,
    createdAt: new Date(Date.now()),
  };
  const story = await Story.create(payload);
  if (!story) {
    next(new ApiError('Failed to create new story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const types = ['thumbnail', 'audio', 'backgroundImage', 'narratorPhoto', 'shortAudio'];

  // if (!fileTypes[0] || !fileTypes[1] || !fileTypes[2] || !fileTypes[4]) {
  //   next(new ApiError(`One of these is missing thumbnail, backgroundImage, audio, shortAudio`, httpCodes.BAD_REQUEST));
  //   return;
  // }

  for (const fileType of fileTypes) {
    if (!types.includes(fileType)) {
      next(new ApiError(`File Type ${fileType} must be of ${types} File Types!`, httpCodes.BAD_REQUEST));
      return;
    }
  }

  const fileResults = await fileResult(story._id, adminId, request, fileTypes);

  for (let key in fileResults) {
    const fileUploadResult = fileResults[key];
    if (fileUploadResult && !fileUploadResult.success) {
      await story.remove();
      next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const latestUpdateStory = await Story.findOne({ _id: story._id });
  if (!latestUpdateStory) {
    next(new ApiError('Failed to get the latest story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { story: latestUpdateStory }, error: null });
  return;
});

/**
 * @description Update a story.
 * @route       PUT /api/stories/:storyId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { storyId } = request.params;
  const { name, title, description, authorName, authorSurname, narratorName, narratorSurname, category, toBeDeleted } =
    request.body;

  const story = await Story.findOne({ _id: storyId, isDeleted: false });
  if (!story) {
    next(new ApiError('Story not found!', httpCodes.NOT_FOUND));
    return;
  }

  const payload = {
    name,
    title,
    description,
    authorName,
    authorSurname,
    narratorName,
    narratorSurname,
    category,
    updatedBy: adminId,
    updatedAt: new Date(Date.now()),
  };

  const editedStory = await Story.findOneAndUpdate({ _id: story._id }, { $set: payload }, { new: true });
  if (!editedStory) {
    next(new ApiError('Failed to update story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const availableValues = ['thumbnail', 'audio', 'backgroundImage', 'narratorPhoto', 'shortAudio'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) editedStory[value] = null;
    });

    await editedStory.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];

    const requiredTypes = ['thumbnail', 'audio', 'backgroundImage', 'narratorPhoto', 'shortAudio'];

    for (const fileType of fileTypes) {
      if (!requiredTypes.includes(fileType)) {
        next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
        return;
      }
    }

    // Check if the file name is same in Story
    if (fileTypes) {
      for (const fileType of fileTypes) {
        if (editedStory[fileType] && request.files[fileType].name === editedStory[fileType].name) {
          next(new ApiError('Story file has same name!', httpCodes.BAD_REQUEST));
          return;
        }
      }
    }

    const fileResults = await fileResult(editedStory._id, adminId, request, fileTypes);

    for (let key in fileResults) {
      const fileUploadResult = fileResults[key];
      if (fileUploadResult && !fileUploadResult.success) {
        next(new ApiError(fileUploadResult.error, httpCodes.INTERNAL_ERROR));
        return;
      }
    }
  }

  const latestUpdateStory = await Story.findOne({ _id: editedStory._id });
  if (!latestUpdateStory) {
    next(new ApiError('Failed to get the latest story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { story: latestUpdateStory }, error: null });
  return;
});

/**
 * @description Delete a story.
 * @route       DELETE /api/stories/:storyId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
  const { storyId } = request.params;

  const story = await Story.findOne({ _id: storyId, isDeleted: false });
  if (!story) {
    next(new ApiError('Story not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedStory = await Story.findOneAndUpdate(
    { _id: story._id },
    {
      $set: {
        isDeleted: true,
        updatedBy: adminId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedStory) {
    next(new ApiError('Failed to delete story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { story: deletedStory }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAllAdmin, getAllMobile, getOne, create, updateOne, deleteOne };

//Create fileResult
async function fileResult(story, adminId, req, fileTypes) {
  if (req.files && Object.keys(req.files).length) {
    const resultObj = {};

    for (const fileType of fileTypes) {
      resultObj[`${fileType}Result`] = null;
    }

    for (const fileType of fileTypes) {
      if (req.files[fileType]) {
        const fileUploadResult = await uploadFile(story, adminId, req, fileType);
        resultObj[`${fileType}Result`] = fileUploadResult;
      }
    }

    return resultObj;
  }
}

const uploadFile = async (storyId, adminId, request, fileType) => {
  if (!request.files[fileType]) {
    return { success: false, data: null, error: `File name must be ${fileType}`, code: httpCodes.BAD_REQUEST };
  }

  const allowedFileTypes = ['thumbnail', 'audio', 'backgroundImage', 'narratorPhoto', 'shortAudio'];

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

  let allowedTypes = ['jpeg', 'jpg', 'png', 'svg', 'mpeg'];
  if (!allowedTypes.includes(type)) {
    return { success: false, data: null, error: `Wrong ${fileType} type!`, code: httpCodes.BAD_REQUEST };
  }

  const story = await Story.findOne({ _id: storyId });
  if (!story) {
    return {
      success: false,
      data: null,
      error: 'Story not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  if (story[fileType] && story[fileType].name === name) {
    return { success: true, data: { updatedStory: story }, error: null, code: null };
  }

  const fileName = `${story._id}_${fileType}_${Date.now()}.${type === 'mpeg' ? 'mp3' : type}`;
  const filePath = path.join(__dirname, `../../public/stories/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/stories/${fileName}`;

  let duration = 0;

  const isAudio = fileType === 'audio' || fileType === 'shortAudio';
  if (isAudio) {
    const metadata = await mm.parseFile(filePath);
    duration = metadata && metadata.format && metadata.format.duration ? metadata.format.duration : 0;
  }

  const updatedStory = await Story.findOneAndUpdate(
    { _id: story._id },
    {
      $set: {
        [fileType]: {
          url: fileURL,
          name: name,
          mimetype: mimetype,
          size: size,
          duration: isAudio ? duration : null,
        },
        updatedBy: adminId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!updatedStory) {
    return {
      success: false,
      data: {},
      error: `Failed to upload ${fileType}!`,
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  return { success: true, data: { updatedStory }, error: null, code: null };
};
