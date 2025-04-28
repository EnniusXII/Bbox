import dotenv from 'dotenv';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import DriverLicense from '../models/DriverLicenseSchema.mjs';

dotenv.config();

// UiPath Orchestrator Configuration
const UIPATH_ORCHESTRATOR_URL = process.env.UIPATH_ORCHESTRATOR_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RELEASE_KEY = process.env.RELEASE_KEY;
const ROBOT_ID = process.env.ROBOT_ID;
const ORG_UNIT_ID = process.env.ORG_UNIT_ID; 

export const addDriversLicense = asyncHandler(async (req, res, next) => {
	const {
		lastName,
		firstName,
		birthDate,
		issueDate,
		expiryDate,
		issuer,
		referenceNumber,
		licenseNumber,
		licenseTypes,
	} = req.body;

	if (!req.body || typeof req.body !== 'object') {
		return next(new ErrorResponse('Invalid request format', 400));
	}

	const missingFields = [];
	if (!lastName) missingFields.push('lastName');
	if (!firstName) missingFields.push('firstName');
	if (!birthDate) missingFields.push('birthDate');
	if (!issueDate) missingFields.push('issueDate');
	if (!expiryDate) missingFields.push('expiryDate');
	if (!issuer) missingFields.push('issuer');
	if (!referenceNumber) missingFields.push('referenceNumber');
	if (!licenseNumber) missingFields.push('licenseNumber');
	if (
		!licenseTypes ||
		!Array.isArray(licenseTypes) ||
		licenseTypes.length === 0
	)
		missingFields.push('licenseTypes');

	if (missingFields.length > 0) {
		console.log('🚨 Missing Required Fields:', missingFields);
		return next(
			new ErrorResponse(
				`Missing fields: ${missingFields.join(', ')}`,
				400
			)
		);
	}

	if (!Array.isArray(licenseTypes)) {
		return next(new ErrorResponse('licenseTypes must be an array', 400));
	}

	const existingLicense = await DriverLicense.findOne({
		user: req.user._id,
		referenceNumber,
	});
	if (existingLicense) {
		return next(
			new ErrorResponse(
				`License already exists for this reference number!`,
				400
			)
		);
	}

	const license = await DriverLicense.create({
		user: req.user._id,
		lastName,
		firstName,
		birthDate,
		issueDate,
		expiryDate,
		issuer,
		referenceNumber,
		licenseNumber,
		licenseTypes,
	});

	res.status(201).json({ success: true, statusCode: 201, license });
});

export const getDriversLicenses = asyncHandler(async (req, res, next) => {
	if (!req.user) {
		return next(new ErrorResponse('User not authenticated', 401));
	}

	const licenses = await DriverLicense.find({ user: req.user._id });

	if (!licenses.length) {
		return res.json({
			success: false,
			message: "No driver's licenses found",
		});
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
					RobotIds: [],
					NoOfRobots: 0
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
  
  export const verifyLicenseData = asyncHandler(async (req, res, next) => {
	  // const { name, lastName, licenseNumber, licenseType } = req.body;
	  const { lastName } = req.body;
	  
	  const license = await DriverLicense.findOne({lastName});
	
	  if (!license) return next(new ErrorResponse("License not found", 404));
	
	  if (license.lastName === lastName) {
		license.isVerified = true;
		await license.save();
		return res.status(200).json({ success: true, message: "License verified." });
	  } else {
		return res.status(400).json({ success: false, message: "License data mismatch." });
	  }
  });
