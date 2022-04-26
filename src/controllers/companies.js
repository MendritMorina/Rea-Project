// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: third-party packages.
const { ObjectId } = require('mongodb');

// Imports: local files.
const { Company } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../config');
const { asyncHandler } = require('../middlewares');
const { isMode } = require('../utils/functions');

/**
 * @description Get all companies.
 */
const getAll = asyncHandler(async (request, response, next) => {
  const { page, limit, pagination } = request.query;
  const fields = getQueryableFields();
  const query = getQueryFromFields(fields, request);

  const companies = await Company.paginate(query, { page, limit, pagination });
  response.status(httpCodes.OK).json({ success: true, data: { companies }, error: null });
});

/**
 * @description Get one company.
 */
const getOne = asyncHandler(async (request, response, next) => {
  const { companyId } = request.params;
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  //.populate('')/////////////////////////////
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
  const { _id: userId } = request.user;
  const { name, email, number, logo } = request.body;

  const companyExists = (await Company.countDocuments({ name, isDeleted: false })) > 0;
  if (companyExists) {
    next(new ApiError('Company with given name already exists!', httpCodes.BAD_REQUEST));
    return;
  }

  const payload = {
    name,
    email,
    number,
    logo,
    createdBy: userId,
  };
  const company = await Company.create(payload);
  if (!company) {
    next(new ApiError('Failed to create new company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.CREATED).json({ success: true, data: { company: updatedCompany }, error: null });
});

/**
 * @description Update one company.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { _id: userId } = request.user;
  const { companyId } = request.params;
  const { name, email, number, logo, toBeDeleted } = request.body;

  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    next(new ApiError('Company not found!', httpCodes.NOT_FOUND));
    return;
  }

  if (name !== company.name) {
    const companyExists = (await Company.countDocuments({ _id: { $ne: company._id }, name, isDeleted: false })) > 0;
    if (companyExists) {
      next(new ApiError('Company with given name already exists!', httpCodes.BAD_REQUEST));
      return;
    }
  }

  const payload = {
    name,
    email,
    number,
    logo,
    lastEditBy: userId,
    lastEditAt: new Date(Date.now()),
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
  const { _id: userId } = request.user;
  const { companyId } = request.params;
  const company = await Company.findOne({ _id: companyId, isDeleted: false });
  if (!company) {
    next(new ApiError('Company not found!', httpCodes.NOT_FOUND));
    return;
  }

  const deletedCompany = await Company.findOneAndUpdate(
    { _id: company._id },
    {
      $set: {
        isDeleted: true,
        lastEditBy: userId,
        lastEditAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedCompany) {
    next(new ApiError('Failed to delete company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { company: deletedCompany }, error: null });
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };

//////////////////////////////////////////////
