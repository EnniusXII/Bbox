import { asyncHandler } from '../middleware/asyncHandler.mjs'; // Import the asyncHandler for error handling
import ErrorResponse from '../models/ErrorResponseModel.mjs'; // Custom error handling class
import DriverLicense from '../models/DriverLicenseSchema.mjs'; // DriverLicense schema/model for interacting with licenses
import Notification from '../models/NotificationSchema.mjs'; // Notification schema/model for sending license verification requests
import GreenCardNotification from '../models/GreeenCardNotificationSchema.mjs';
import GreenCard from '../models/GreenCardSchema.mjs';

export const recordVerification = async (req, res) => {
	const { requestId, userAddress, licenseType, isVerified } = req.body;
	try {
		const tx = await contract.recordVerification(
			requestId,
			userAddress,
			licenseType,
			isVerified
		);
		const receipt = await tx.wait();
		const transactionHash = receipt.hash;

		await Notification.findByIdAndUpdate(requestId, { transactionHash });
		res.status(200).json({
			success: true,
			message: 'Verification recorded on-chain',
			transactionHash,
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

export const getVerificationStatus = async (req, res) => {
	const { requestId } = req.params;
	try {
		const [isVerified, licenseType, timestamp, userAddress] =
			await contract.getVerificationStatus(requestId);

		const notification = await Notification.findById(requestId);
		const transactionHash = notification.transactionHash || 'Not available';

		res.status(200).json({
			isVerified,
			licenseType,
			timestamp: timestamp.toString(),
			userAddress,
			transactionHash,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// This function verifies if a driver's license exists and creates a verification request if it does.
export const verifyDriverLicense = asyncHandler(async (req, res, next) => {
	const { lastName, name, licenseType } = req.body; // Extract details from request body

	const license = await DriverLicense.findOne({ lastName, name });
	if (!license) {
		return next(new ErrorResponse('User not found', 404));
	}

	const notification = await Notification.create({
		user: license.user, // The user to whom the license belongs
		message: `Verification request for ${licenseType} license. Do you want to share your information?`,
		requestId: license._id, // ID of the license for tracking the request
		name,
		lastName, // Add lastName to the notification
		licenseType, // Add licenseType to the notification
		status: 'pending', // Set status to pending while awaiting response
	});

	// Respond to the client that the verification request was successfully sent
	res.status(200).json({
		success: true,
		message: 'Verification request sent. Awaiting approval.',
		requestId: notification._id, // Send the notification request ID to the client
	});
});

// This function handles the approval of a driver's license verification request.
export const approveLicenseVerification = asyncHandler(
	async (req, res, next) => {
		const requestId = req.params.requestId; // Extract the requestId from URL params
		const { lastName, licenseType } = req.body;

		if (!requestId) {
			// If no requestId is provided, return an error
			return next(new ErrorResponse('No request ID provided.', 400));
		}

		// Find the notification by its requestId
		const notification = await Notification.findById(requestId);
		if (!notification) {
			// If no matching notification is found, return an error
			return next(
				new ErrorResponse(
					'No verification request found for this ID.',
					404
				)
			);
		}

		// Find the driver's license associated with the notification's requestId
		const license = await DriverLicense.findOne({
			_id: notification.requestId,
		});
		if (!license) {
			// If no driver's license is found for the request, return an error
			return next(
				new ErrorResponse("No driver's license found for this ID.", 404)
			);
		}

		if (
			license.lastName !== lastName ||
			license.licenseType !== licenseType
		) {
			return next(
				new ErrorResponse(
					'You do not possess the requested license type. Verification failed.',
					400
				)
			);
		}

		// Set the license verification to approved
		license.isApproved = true;
		await license.save(); // Save the updated license status

		// Update the notification status to 'approved'
		notification.status = 'approved';
		await notification.save(); // Save the updated notification status

		// Respond to the client that the verification was approved
		res.status(200).json({
			success: true,
			message: "Driver's license verification approved.",
		});
	}
);

// This function handles the decline of a driver's license verification request.
export const declineLicenseVerification = asyncHandler(
	async (req, res, next) => {
		const requestId = req.params.requestId; // Extract the requestId from URL params

		// Update the notification status to "declined"
		const notification = await Notification.findByIdAndUpdate(
			requestId,
			{ status: 'declined' }, // Update the status to declined
			{ new: true } // Return the updated document
		);

		if (!notification) {
			// If no matching notification is found, return an error
			return next(
				new ErrorResponse(
					'No verification request found with this ID.',
					404
				)
			);
		}

		// Respond to the client that the verification request was declined
		res.status(200).json({
			success: true,
			message: 'Verification request has been declined.',
		});
	}
);

export const verifyGreenCard = asyncHandler(async (req, res) => {
	try {
		const { referenceId } = req.body;

		if (!referenceId) {
			return res.status(400).json({
				success: false,
				message: 'Missing required field: referenceId',
			});
		}

		// 🔥 Find the verification request
		let verificationRequest = await GreenCardNotification.findOne({
			referenceId,
			status: 'pending',
		});

		if (!verificationRequest) {
			// Fetch Green Card to get the owner
			const greenCard = await GreenCard.findOne({ referenceId });

			if (!greenCard) {
				return res.status(404).json({
					success: false,
					message: 'Green Card not found',
				});
			}

			if (!greenCard.user) {
				return res.status(400).json({
					success: false,
					message: 'Green Card owner not found.',
				});
			}

			// ✅ Create the verification request with correct data
			verificationRequest = await GreenCardNotification.create({
				requestId: new mongoose.Types.ObjectId(),
				referenceId,
				user: req.user._id, // Requesting user
				owner: greenCard.user, // Owner of the Green Card
				message: `Verification request for Green Card ${referenceId}. Do you approve?`,
				status: 'pending',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Verification request sent.',
			requestId: verificationRequest._id,
		});
	} catch (error) {
		console.error('❌ Error verifying Green Card:', error);
		return res.status(500).json({
			success: false,
			message: 'Verification failed.',
		});
	}
});

export const approveGreenCardVerification = asyncHandler(async (req, res) => {
	try {
		const { requestId } = req.params;

		const verificationRequest = await GreenCardNotification.findById(
			requestId
		);

		if (!verificationRequest) {
			console.warn(
				`❌ Verification request not found for ID: ${requestId}`
			);
			return res.status(404).json({
				success: false,
				message: 'Verification request not found.',
			});
		}

		if (!verificationRequest.user) {
			console.warn('❌ Owner field is missing in verification request.');
			return res.status(400).json({
				success: false,
				message: 'Owner field is missing in verification request.',
			});
		}

		// 🔥 Approve verification
		verificationRequest.status = 'approved';
		await verificationRequest.save();

		return res.status(200).json({
			success: true,
			message: 'Verification request approved.',
		});
	} catch (error) {
		console.error('❌ Error approving verification request:', error);
		return res.status(500).json({
			success: false,
			message: 'Approval failed.',
		});
	}
});

export const declineGreenCardVerification = asyncHandler(async (req, res) => {
	try {
		const { requestId } = req.params;

		// Validate that requestId is provided
		if (!requestId) {
			console.error(`❌ requestId is missing from request.`);
			return res.status(400).json({
				success: false,
				message: 'Missing required field: requestId.',
			});
		}

		// 🔍 Fetch the verification request
		const verificationRequest = await GreenCardNotification.findById(
			requestId
		);

		if (!verificationRequest) {
			console.error(
				`❌ No verification request found for ID: ${requestId}`
			);
			return res.status(404).json({
				success: false,
				message: 'Verification request not found.',
			});
		}

		// 🔍 Check if owner field exists
		if (!verificationRequest.user) {
			console.error(
				`❌ Owner field is missing in verification request:`,
				verificationRequest
			);
			return res.status(400).json({
				success: false,
				message: 'Owner field is missing in verification request.',
			});
		}

		// 🔥 Ensure the logged-in user is the owner of the Green Card
		if (
			!req.user ||
			verificationRequest.user.toString() !== req.user._id.toString()
		) {
			console.error(
				`❌ Unauthorized attempt to decline request by user:`,
				req.user
			);
			return res.status(403).json({
				success: false,
				message: 'You are not authorized to decline this request.',
			});
		}

		// ✅ Update request status to "declined"
		verificationRequest.status = 'declined';
		await verificationRequest.save();

		return res.status(200).json({
			success: true,
			message: 'Verification request declined successfully.',
		});
	} catch (error) {
		console.error('❌ Error declining verification request:', error);
		return res.status(500).json({
			success: false,
			message: 'Decline failed due to server error.',
			error: error.message,
		});
	}
});

export const recordGreenCardVerification = asyncHandler(
	async (req, res, next) => {
		const { requestId, userAddress, isVerified } = req.body;

		try {
			const tx = await contract.recordGreenCardVerification(
				requestId,
				userAddress,
				'GREEN_CARD',
				isVerified
			);
			const receipt = await tx.wait();
			const transactionHash = receipt.hash;

			await GreenCardNotification.findByIdAndUpdate(requestId, {
				transactionHash,
			});

			res.status(200).json({
				success: true,
				message: 'Verification recorded on-chain',
				transactionHash,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	}
);

export const getGreenCardVerificationStatus = asyncHandler(
	async (req, res, next) => {
		const { requestId } = req.params;

		try {
			const notification = await GreenCardNotification.findById(
				requestId
			);

			if (!notification) {
				return next(
					new ErrorResponse(
						'No verification request found for this ID: ',
						404
					)
				);
			}

			res.status(200).json({
				success: true,
				status: notification.status,
				message: `Verification request status: ${notification.status}`,
			});
		} catch (err) {
			res.status(500).json({ success: false, message: err.message });
		}
	}
);
