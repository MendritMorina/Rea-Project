// Imports: core node modules.
const path = require('path');
const fs = require('fs');

// Imports: local files.
const { Company } = require('../models');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');
const { getMode } = require('../utils/functions');

/**
 * @description Get all companies.
 * @route       GET /api/companies.
 * @access      Public.
 */
const getAll = asyncHandler(async (request, response) => {
  const { page, limit, pagination } = request.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    pagination: pagination,
  };

  const query = { isDeleted: false };

  const companies = await Company.paginate(query, options);

  response.status(httpCodes.OK).json({ success: true, data: { companies }, error: null });
  return;
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
    next(new ApiError('Company with given id not found!', httpCodes.NOT_FOUND));
    return;
  }
  response.status(httpCodes.OK).json({ success: true, data: { company }, error: null });
  return;
});

/**
 * @description Create a company.
 * @route       POST /api/companies.
 * @access      Private.
 */
const create = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
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
    createdBy: adminId,
    createdAt: new Date(Date.now()),
  };
  const company = await Company.create(payload);
  if (!company) {
    next(new ApiError('Failed to create new company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  let logoResult = null;

  if (request.files && Object.keys(request.files).length && request.files['logo']) {
    logoResult = await uploadLogo(company._id, adminId, request);
    if (!logoResult.success) {
      next(new ApiError(logoResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedCompany = logoResult && logoResult.success && logoResult.data ? logoResult.data.updatedCompany : company;
  response.status(httpCodes.CREATED).json({ success: true, data: { company: updatedCompany }, error: null });
  return;
});

/**
 * @description Update a company.
 * @route       PUT /api/companies/:companyId.
 * @access      Private.
 */
const updateOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
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
    updatedBy: adminId,
    updatedAt: new Date(Date.now()),
  };

  const editedCompany = await Company.findOneAndUpdate({ _id: company._id }, { $set: payload }, { new: true });
  if (!editedCompany) {
    next(new ApiError('Failed to update company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  let logoResult = null;
  if (request.files && Object.keys(request.files).length && request.files['logo']) {
    logoResult = await uploadLogo(company._id, adminId, request);
    if (!logoResult.success) {
      next(new ApiError(logoResult.error, httpCodes.INTERNAL_ERROR));
      return;
    }
  }

  const updatedCompany = logoResult && logoResult.success && logoResult.data ? logoResult.data.updatedCompany : company;
  response.status(httpCodes.CREATED).json({ success: true, data: { company: updatedCompany }, error: null });
  return;
});

/**
 * @description Delete a company.
 * @route       DELETE /api/companies/:companyId.
 * @access      Private.
 */
const deleteOne = asyncHandler(async (request, response, next) => {
  const { _id: adminId } = request.admin;
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
        updatedBy: adminId,
        updatedAt: new Date(Date.now()),
      },
    },
    { new: true }
  );
  if (!deletedCompany) {
    next(new ApiError('Failed to delete company!', httpCodes.INTERNAL_ERROR));
    return;
  }

  response.status(httpCodes.OK).json({ success: true, data: { company: deletedCompany }, error: null });
  return;
});

// Exports of this file.
module.exports = { getAll, getOne, create, updateOne, deleteOne };

const uploadLogo = async (companyId, adminId, request) => {
  const targetName = 'logo';
  if (!request.files[targetName]) {
    return { success: false, data: null, error: `File name must be ${targetName}`, code: httpCodes.BAD_REQUEST };
  }

  const { data, mimetype, name, size } = request.files[targetName];

  const type = mimetype.split('/').pop();
  const allowedTypes = ['jpeg', 'jpg', 'png'];
  if (!allowedTypes.includes(type)) {
    return { success: false, data: null, error: 'Wrong image type!', code: httpCodes.BAD_REQUEST };
  }

  const company = await Company.findOne({ _id: companyId });
  if (!company) {
    return {
      success: false,
      data: null,
      error: 'Company not found!',
      code: httpCodes.INTERNAL_ERROR,
    };
  }

  const fileName = `${company._id}_${Date.now()}.${type}`;
  const filePath = path.join(__dirname, `../../public/companies/${fileName}`);

  try {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
  } catch (error) {
    console.log(error);
    return { success: false, data: null, error: 'Failed to upload logo!', code: httpCodes.INTERNAL_ERROR };
  }

  const publicURL = getMode('production') ? process.env.PUBLIC_PROD_URL : process.env.PUBLIC_DEV_URL;
  const fileURL = `${publicURL}/companies/${fileName}`;

  const updatedCompany = await Company.findOneAndUpdate(
    { _id: company._id },
    {
      $set: {
        logo: {
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
  if (!updatedCompany) {
    return { success: false, data: null, error: 'Failed to upload logo!', code: httpCodes.INTERNAL_ERROR };
  }

  return { success: true, data: { updatedCompany }, error: null, code: null };
};
