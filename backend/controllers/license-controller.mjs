import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import DriverLicense from "../models/DriverLicenseSchema.mjs";

// UiPath Orchestrator Configuration
const UIPATH_ORCHESTRATOR_URL = "https://cloud.uipath.com/blackslvmmzz/DefaultTenant/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs";
const ACCESS_TOKEN = "rt_E85738A1C0E55DB361212B36516D5D9D6C96C171F7DB554B27B2D61E319EBEB8-1"; // Replace with your actual token
const RELEASE_KEY = "80f72dd0-a1d4-414c-a828-c294bc1adb07"; // Replace with your UiPath Process Release Key
const ROBOT_ID = "[]"; // Replace with your Robot ID
const ORG_UNIT_ID = "cf6ac195-26eb-4f43-bc9e-b3019fcf900f";

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


export const getLicenseData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
  }

  try {
      const response = await fetch(UIPATH_ORCHESTRATOR_URL, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "X-UIPATH-OrganizationUnitId": ORG_UNIT_ID // ✅ Add this header
          },
          body: JSON.stringify({
              startInfo: {
                  ReleaseKey: RELEASE_KEY,
                  Strategy: "ModernJobsCount",
                  RobotIds: [ROBOT_ID],
                  NoOfRobots: 1
              }
          })
      });

      if (!response.ok) {
          const errorData = await response.json();
          return next(new ErrorResponse(`Failed to start UiPath job: ${JSON.stringify(errorData)}`, response.status));
      }

      const responseData = await response.json();
      res.status(200).json({ success: true, message: "UiPath job triggered successfully", data: responseData });
  } catch (error) {
      return next(new ErrorResponse("Failed to trigger UiPath job", 500));
  }
});
  