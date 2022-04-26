const Recommendation = require('../models/Recommendation');
const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');

/**
 * @description Get all Recommendations.
 * @route       GET /api/recommendations.
 * @access      Public.
 */
const getAll = asyncHandler(async (req, res) => {
  const recommendations = await Recommendation.find()
    .select('name description recommendationCards')
    .populate('recommendationCards');

  res.status(200).json({ success: true, count: recommendations.length, data: recommendations, error: null });
});

/**
 * @description Get Recommandation by id.
 * @route       GET /api/recommendations/:id.
 * @access      Public.
 */
const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false }).select(
    'name description recommendationCards'
  );

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendation }, error: null });
});

/**
 * @description Create a recommendation.
 * @route       POST /api/recommendations/create.
 * @access      Private.
 */
// const create = asyncHandler(async (req, res) => {
//   const re = new Recommendation(req.body);

//   const savedRe = await re.save();

//   res.status(200).json({ success: true, data: savedRe, error: null });
// });

const create = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    recommendationCards,
    category,
  } = req.body;

  const recommendationExists = (await Recommendation.countDocuments({ name, isDeleted: false })) > 0;
  if (recommendationExists) {
    next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    recommendationCards,
    category,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };

  const recommendation = await Recommendation.create(payload);
  if (!recommendation) {
    next(new ApiError('Failed to create new recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: recommendation, error: null });
});

/**
 * @description Delete a recommendation.
 * @route       DELETE /api/recommendations/:id.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedRecommendation) {
    next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendation: deletedRecommendation }, error: null });
});

// const deleteOne = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const recommendation = await Recommendation.findById(id);

//   if (!recommendation) {
//     next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
//     return;
//   }

//   const result = await Recommendation.findByIdAndDelete(req.params.id);

//   res.status(200).json({ success: true, data: {}, error: null });
// });

/**
 * @description Update a recommendation.
 * @route       PUT /api/recommendations/:id.
 * @access      Private.
 */
const updateOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;
  const {
    name,
    description,
    weather,
    aqi,
    haveDiseaseDiagnosis,
    energySource,
    hasChildren,
    hasChildrenDisease,
    recommendationCards,
    category,
  } = req.body;

  const recommendation = await Recommendation.findOne({ _id: id, isDeleted: false });
  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== recommendation.name) {
    const recommendationExists =
      (await Recommendation.countDocuments({ _id: { $ne: id }, name, isDeleted: false })) > 0;
    if (recommendationExists) {
      next(new ApiError('Recommendation with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    description,
    weather,
    haveDiseaseDiagnosis,
    energySource,
    aqi,
    hasChildren,
    hasChildrenDisease,
    recommendationCards,
    category,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };
  const editedRecommendation = await Recommendation.findOneAndUpdate(
    { _id: recommendation._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedRecommendation) {
    next(new ApiError('Failed to update recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendation: editedRecommendation }, error: null });
});

// const updateOne = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, description } = req.body;

//   const re = await Recommendation.findById(id);

//   if (!re) {
//     next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
//     return;
//   }

//   const uRe = await Recommendation.findByIdAndUpdate(id, { $set: { name, description } }, { new: true });

//   res.status(200).json({ success: true, data: uRe, error: null });
// });

// // Get all Recommendations
// exports.getAll = async (req, res) => {
//   try {
//     const result = await Recommendation.find()
//       .select('name description recommendationCards')
//       .populate('recommendationCards');

//     res.status(200).json({ success: true, data: result, error: null });
//   } catch (err) {
//     res.status(400).json({ success: false, data: {}, error: err });
//   }
// };

// // Get Recommendation by Id
// exports.getOne = (req, res) => {
//   Recommendation.findById(req.params.id)
//     .select('name description recommendationCards')
//     .then((result) => {
//       res.status(200).json({ success: true, data: result, error: null });
//     })
//     .catch((err) => {
//       res.status(400).json({ success: false, data: {}, error: err });
//     });
// };

// // Add Recommendation
// const create = (req, res) => {
//   const re = new Recommendation(req.body);

//   re.save()
//     .then((result) => {
//       res.status(200).json({ success: true, data: result, error: null });
//     })
//     .catch((err) => {
//       res.status(400).json({ success: false, data: {}, error: err });
//     });
// };

// // Update Recommendation
// const updateOne = (req, res) => {
//   const re = new Recommendation(req.body);

//   Recommendation.findByIdAndUpdate(req.params.id, req.body, { new: true })
//     .then((result) => {
//       res.status(200).json({ success: true, data: result, error: null });
//     })
//     .catch((err) => {
//       res.status(200).json({ success: false, data: {}, error: err });
//     });
// };

// // Delete Recommendation
// const deleteOne = (req, res) => {
//   Recommendation.findByIdAndDelete(req.params.id)
//     .then((result) => {
//       res.status(200).json({ success: true, data: result, error: null });
//     })
//     .catch((err) => {
//       res.status(200).json({ success: false, data: {}, error: err });
//     });
// };

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
