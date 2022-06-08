// Imports: core node modules.
const path = require('path');
const fs = require('fs');

// Imports: local files.
const { Story } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { getMode } = require('../utils/functions');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all stories.
 * @route       GET /api/stories.
 * @access      Public
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
  };

  const query = { isDeleted: false };
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
  const { name, title, description, authorName, authorSurname, narratorName, narratorSurname, category, length } =
    request.body;

  const payload = {
    name,
    title,
    description,
    authorName,
    authorSurname,
    narratorName,
    narratorSurname,
    category,
    length,
    createdBy: adminId,
    createdAt: new Date(Date.now()),
  };
  const story = await Story.create(payload);
  if (!story) {
    next(new ApiError('Failed to create new story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const fileTypes = request.files ? Object.keys(request.files) : [];
  const requiredTypes = ['thumbnail', 'audio', 'backgroundImage'];

  if (fileTypes.length !== 3) {
    await story.remove();
    next(new ApiError('You must input all 3 file Types!', httpCodes.BAD_REQUEST));
    return;
  }

  for (const fileType of fileTypes) {
    if (!requiredTypes.includes(fileType)) {
      next(new ApiError(`File Type ${fileType} must be of ${requiredTypes} File Types!`, httpCodes.BAD_REQUEST));
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
  const { name, title, description, authorName, authorSurname, narratorName, narratorSurname, category, length, toBeDeleted } =
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
    length,
    updatedBy: adminId,
    updatedAt: new Date(Date.now()),
  };

  const editedStory = await Story.findOneAndUpdate({ _id: story._id }, { $set: payload }, { new: true });
  if (!editedStory) {
    next(new ApiError('Failed to update story!', httpCodes.INTERNAL_ERROR));
    return;
  }

  const availableValues = ['thumbnail', 'audio', 'backgroundImage'];
  const toBeDeletedinfo = toBeDeleted && toBeDeleted.length ? toBeDeleted : [];

  if (toBeDeletedinfo.length > 0) {
    availableValues.forEach((value) => {
      if (toBeDeletedinfo.includes(value)) editedStory[value] = null;
    });

    await editedStory.save();
  }

  if (request.files) {
    const fileTypes = request.files ? Object.keys(request.files) : [];

    const requiredTypes = ['thumbnail', 'audio', 'backgroundImage'];

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
module.exports = { getAll, getOne, create, updateOne, deleteOne };

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

  const allowedFileTypes = ['thumbnail', 'audio', 'backgroundImage'];

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

  let allowedTypes = ['jpeg', 'jpg', 'png', 'mp4'];

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

  const fileName = `${story._id}_${fileType}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/stories/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode() === 'production' ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/stories/${fileName}`;

  const updatedStory = await Story.findOneAndUpdate(
    { _id: story._id },
    {
      $set: {
        [fileType]: {
          url: fileURL,
          name: name,
          mimetype: mimetype,
          size: size,
        },
        updatedBy: adminId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!updatedStory) {
    return { success: false, data: null, error: `Failed to upload ${fileType}!`, code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedStory }, error: null, code: null };
};
