const RecommendationCard = require('../models/RecommendationCard');
const Recommendation = require('../models/Recommendation');
const { asyncHandler } = require('../middlewares');

const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');

/**
 * @description Get all RecommendationCards.
 * @route       GET /api/recommendationCards.
 * @access      Public.
 */
const getAll = asyncHandler(async (req, res) => {
  const { page, limit, select, sort } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    select: select ? req.query.select.split(',').join(' ') : 'name description',
    sort: sort ? req.query.sort.split(',').join(' ') : 'name',
    populate: 'recommendation',
    //query: { recommendation: req.params.recommendationId },
    //query: { name: 'Reccomendation Card creatrdingassdqs' },
  };

  let result = null;
  if (req.params.recommendationId) {
    result = await RecommendationCard.paginate({ recommendation: req.params.recommendationId }, options);
    //result = await RecommendationCard.paginate({ name: 'Reccomendation Card creatrdingassdqs ' }, options);
  } else {
    result = await RecommendationCard.paginate({}, options);
  }

  // let result = null;
  // if (req.params.recommendationId) {
  //   result = await RecommendationCard.find({ recommendation: req.params.recommendationId });
  // } else {
  //   result = await RecommendationCard.find();
  // }

  return res.status(200).json({ success: true, count: result.length, data: result, error: null });
});

// exports.getAll = async (req, res) => {
//   if (req.params.recommendationId) {
//     try {
//       const result = await RecommendationCard.find({ recommendation: req.params.recommendationId });

//       return res.status(200).json({ success: true, data: result, error: null });
//     } catch (err) {
//       res.status(400).json({ success: false, data: {}, error: err });
//     }
//   } else {
//     try {
//       const result = await RecommendationCard.find();

//       return res.status(200).json({ success: true, data: result, error: null });
//     } catch (err) {
//       res.status(400).json({ success: false, data: {}, error: err });
//     }
//   }
// };

/**
 * @description Get RecommandationCard by id.
 * @route       GET /api/recommendationCards/:id.
 * @access      Public.
 */
const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: id, isDeleted: false })
    .select('name description')
    .populate('recommendation');

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  res.status(httpCodes.OK).json({ success: true, data: { recommendationCard }, error: null });
});

// exports.getOne = async (req, res) => {
//   try {
//     const result = await RecommendationCard.findById(req.params.id);

//     res.status(200).json({ success: true, data: result, error: null });
//   } catch (err) {
//     res.status(400).json({ success: false, data: {}, error: err });
//   }
// };

/**
 * @description Create a recommendationCard.
 * @route       POST /api/recommendationCards/create.
 * @access      Private.
 */
const create = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { name, description, recommendationIdBody } = req.body;

  if (req.params.recommendationId) {
    const recommendation = await Recommendation.findOne({ _id: req.params.recommendationId, isDeleted: false });

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

    // const updatedRecommendation = await recommendation.updateOne({
    //   $push: { recommendationCards: recommendationCard._id },
    // });
    const updatedRecommendation = await Recommendation.findOneAndUpdate(
      { _id: recommendation._id },
      {
        $push: { recommendationCards: recommendationCard._id },
      }
    );

    return res.status(200).json({ success: true, data: { recommendationCard, updatedRecommendation }, error: null });
  } else {
    const recommendation = await Recommendation.findOne({ _id: recommendationIdBody, isDeleted: false });

    if (!recommendation) {
      next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
      return;
    }

    const recommendationCard = await RecommendationCard.create({
      name,
      description,
      recommendation: recommendationIdBody,
    });
    // const updatedRecommendation = await recommendation.updateOne({
    //   $push: { recommendationCards: recommendationCard._id },
    // });
    const updatedRecommendation = await Recommendation.findOneAndUpdate(
      { _id: recommendation._id },
      {
        $push: { recommendationCards: recommendationCard._id },
      }
    );

    return res.status(200).json({ success: true, data: { recommendationCard, updatedRecommendation }, error: null });
  }
});

// exports.create = async (req, res) => {
//   const { name, description } = req.body;

//   if (req.params.recommendationId) {
//     try {
//       const re = await Recommendation.findById(req.params.recommendationId);
//       if (!re) {
//         res.status(400).json({ success: false, data: {}, error: err });
//         throw new Error('Recommendation with id not found');
//       }

//       const rec = new RecommendationCard({ name, description, recommendation: req.params.recommendationId });
//       const savedRec = await rec.save();
//       const updatedRe = await re.updateOne({ $push: { recommendationCards: rec._id } });
//       return res.status(200).json({ success: true, data: { savedRec, updatedRe }, error: null });
//     } catch (err) {
//       return res.status(400).json({ success: false, data: {}, error: err });
//     }
//   } else {
//     try {
//       const result = await RecommendationCard.create({ name, description });

//       return res.status(200).json({ success: true, data: result, error: null });
//     } catch (err) {
//       return res.status(400).json({ success: false, data: {}, error: err });
//     }
//   }
// };

/**
 * @description Delete a recommendationCard.
 * @route       DELETE /api/recommendationCards/:id.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;

  const recommendationCard = await RecommendationCard.findOne({ _id: id, isDeleted: false });

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
  if (!deletedRecommendationCard) {
    next(new ApiError('Failed to delete recommendation!', httpCodes.INTERNAL_ERROR));
    return;
  }

  // const updatedRecommendation = await recommendation.updateOne({
  //   $pull: { recommendationCards: recommendationCard._id },
  // });

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

  res
    .status(httpCodes.OK)
    .json({ success: true, data: { recommendationCard: deletedRecommendationCard }, error: null });
});

// exports.deleteOne = asyncHandler(async (req, res) => {
//   const result = await RecommendationCard.findByIdAndDelete(req.params.id);

//   res.status(200).json({ success: true, data: result, error: null });
// });

// exports.deleteOne = async (req, res) => {
//   try {
//     const result = await RecommendationCard.findByIdAndDelete(req.params.id);

//     res.status(200).json({ success: true, data: result, error: null });
//   } catch (err) {
//     res.status(400).json({ success: false, data: {}, error: err });
//   }
// };

/**
 * @description Update a recommendationCard.
 * @route       PUT /api/recommendationCards/:id.
 * @access      Private.
 */
const updateOne = asyncHandler(async (req, res, next) => {
  const userId = '625e6c53419131c236181826';
  const { id } = req.params;
  const { name, description, recommendationIdBody } = req.body;

  const recommendationCard = await RecommendationCard.findOne({ _id: id, isDeleted: false });

  if (!recommendationCard) {
    next(new ApiError('RecommendationCard not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== recommendationCard.name) {
    const recommendationExists =
      (await RecommendationCard.countDocuments({ _id: { $ne: id }, name, isDeleted: false })) > 0;
    if (recommendationExists) {
      next(new ApiError('RecommendationCard with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    description,
    recommendation: recommendationIdBody,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
  };

  console.log(payload);

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

  const recommendation = await Recommendation.findOne({ _id: recommendationCard.recommendation, isDeleted: false });

  if (!recommendation) {
    next(new ApiError('Recommendation not found!', httpCodes.NOT_FOUND));
    return;
  }

  await recommendation.updateOne({
    $pull: { recommendationCards: recommendationCard._id },
  });

  await recommendation.updateOne({
    $push: { recommendationCards: editedRecommendationCard._id },
  });

  res.status(httpCodes.OK).json({ success: true, data: { recommendationCard: editedRecommendationCard }, error: null });
});

// exports.updateOne = asyncHandler(async (req, res) => {
//   const result = await RecommendationCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.status(200).json({ success: true, data: result, error: null });
// });

// exports.updateOne = async (req, res) => {
//   try {
//     const result = await RecommendationCard.findByIdAndUpdate(req.params.id, req.body ,{ new: true});

//     res.status(200).json({ success: true, data: result, error: null });
//   } catch (err) {
//     res.status(400).json({ success: false, data: {}, error: err });
//   }
// };

// Exports of this file.
module.exports = { getAll, getOne, create, deleteOne, updateOne };
