import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import DriverLicense from "../models/DriverLicenseSchema.mjs";

export const addDriversLicense = asyncHandler(async (req, res, next) => {
    const {lastName, name, birthdate, licenseType} = req.body;
    
    if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    const existingLicense = await DriverLicense.findOne({ user: req.user._id, licenseType });
    if (existingLicense) {
        return next(new ErrorResponse(`You already have a registered driver's license of type: ${licenseType}`, 400));
    }

    const license = await DriverLicense.create({lastName, name, birthdate, licenseType, user: req.user._id});

    res.status(201).json({success: true, statusCode: 201, data: license});
});

export const getDriversLicenses = asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    const licenses = await DriverLicense.find({ user: req.user._id });

    if (!licenses.length) {
      return res.status(404).json({ success: false, message: "No driver's licenses found" });
    }

    res.status(200).json({ success: true, data: licenses });
});

  