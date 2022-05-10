// Imports: local files.
const { Company } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');

/**
 * @description Get all companies.
 * @route       GET /api/companies.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const query = {
    isDeleted: false,
  };

  const companies = await Company.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { companies }, error: null });
});
/**
 * @description Get company by id.
 * @route       GET /api/companies/:companyId.
 * @access      Public.
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
 * @description Create a company.
 * @route       POST /api/companies.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
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
    createdBy: userId,
    createdAt: new Date(Date.now()),
  };
  const company = await Company.create(payload);
  if (!company) {
    next(new ApiError('Failed to create new company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  //let logoResult = null;

  //if (request.files && Object.keys(request.files).length && request.files['logo']) {
  //  logoResult = await uploadLogo(company._id, userId, request);
  //  if (!logoResult.success) {
  //    next(new ApiError(logoResult.error, httpCodes.INTERNAL_ERROR));
  //    return;
  //  }
  //}
  //const updatedcompany = logoResult && logoResult.success && logoResult.data ? logoResult.data.updatedcompnay : company;

  response.status(httpCodes.CREATED).json({ success: true, data: { company }, error: null });
});

/**
 * @description Update a company.
 * @route       PUT /api/companies/:companyId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
  const { companyId } = request.params;
  const { name, email, number } = request.body;

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

  response.status(httpCodes.CREATED).json({ success: true, data: { company: editedCompany }, error: null });
});

/**
 * @description Delete a company.
 * @route       DELETE /api/companies/:companyId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const userId = '625e6c53419131c236181826';
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
