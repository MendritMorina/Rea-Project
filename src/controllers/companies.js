// Imports: local files.
const { Company } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all companies.
 */
const getAll = asyncHandler(async (request, response, next) => {});

/**
 * @description Get one company.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { companyId } = request.params;
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    next(new ApiError('Company not found!', httpCodes.NOT_FOUND));
    return;
  }
  response.status(httpCodes.OK).json({ success: true, data: { company }, error: null });
});

/**
 * @description Create new company.
 */
const create = asyncHandler(async (request, response, next) => {
  const { name, email, number } = request.body;

  const companyExists = (await Company.countDocuments({ name, isDeleted: false })) > 0;
  if (companyExists) {
    next(new ApiError('Company with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    email,
    number,
  };
  const company = await Company.create(payload);
  if (!company) {
    next(new ApiError('Failed to create new company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  let logoResult = null;

  if (request.files && Object.keys(request.files).length && request.files['logo']) {
    logoResult = await uploadLogo(company._id, userId, request);
    if (!logoResult.success) {
      next(new ApiError(logoResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedCompany = logoResult && logoResult.success && logoResult.data ? logoResult.data.updatedCompnay : Company;
  response.status(httpCodes.CREATED).json({ success: true, data: { company: updatedCompany }, error: null });
});

/**
 * @description Update one company.
 */

const updateOne = asyncHandler(async (request, response, next) => {
  const { companyId } = request.params;
  const { name, email, number } = request.body;

  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    next(new ApiError('Company not found!', httpCodes.NOT_FOUND));
    return;
  }
  const payload = {
    name,
    email,
    number,
  };
  const editedCompany = await Company.findOneAndUpdate(
    { _id: company._id },
    {
      $set: payload,
    },
    { new: true }
  );
  if (!editedCompany) {
    next(new ApiError('Failed to update company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { company: updatedCompany }, error: null });
});

/**
 * @description Delete one company.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const { companyId } = request.params;
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    next(new ApiError('Company not found!', httpCodes.NOT_FOUND));
    return;
  }
  if (!deletedCompany) {
    next(new ApiError('Failed to delete company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { company: deletedCompany }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };
