import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';
import DriverLicense from '../models/DriverLicenseSchema.mjs';

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

	res.status(201).json({ success: true, statusCode: 201, data: license });
});

export const getDriversLicenses = asyncHandler(async (req, res, next) => {
	if (!req.user) {
		return next(new ErrorResponse('User not authenticated', 401));
	}

	const licenses = await DriverLicense.find({ user: req.user._id });

	if (!licenses.length) {
		return res
			.status(404)
			.json({ success: false, message: "No driver's licenses found" });
	}

	res.status(200).json({ success: true, data: licenses });
});
