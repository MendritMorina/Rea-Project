// Imports: core node modules.
//const path = require('path');
//const fs = require('fs');

// Imports: local files.
const { UsedCoupon } = require('../models');
const {Coupon} = require('../models/Coupon');
const { ApiError } = require('../utils/classes');
const { httpCodes } = require('../configs');
const { asyncHandler } = require('../middlewares');
//const { getMode } = require('../utils/functions');



const createUseCoupon = asyncHandler(async (request, response, next) => {
  const { user, coupon } = request.body;
  const CreateCouponDate;
  //A ekziston kuponi ne databaze
  const couponExistDb = await Coupon.find({ _id: coupon });
  if (couponExistDb) {
    //Kontrollo a eshte valid
    if (CreateCouponDate > startDate || CreateCouponDate < expirationDate) {

    }else{
        next(new ApiError('Invalid', httpCodes.UNAUTHORIZED));
    return;
    }
    

  const typeofCoupon;
  if(typeofCoupon=='singular' ){
    next(new ApiError(`Eshte perdorur nga ky user: ${user}`, httpCodes.BAD_REQUEST));
    return;
  } else if (typeofCoupon=='plurar'){
    const UsedCoupon =(await User.countDocuments({ _id: { $ne: user._id }, isDeleted: false })) > 0;
  }
}
});


