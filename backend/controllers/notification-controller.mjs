import Notification from '../models/NotificationSchema.mjs';
import GreenCardNotification from '../models/GreeenCardNotificationSchema.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const getNotifications = asyncHandler(async (req, res, next) => {
	const userId = req.user.id;

	const notifications = await Notification.find({
		user: userId,
		isRead: false,
	});

	res.status(200).json({
		success: true,
		data: notifications,
	});
});

export const getNotificationStatus = asyncHandler(async (req, res, next) => {
	const { requestId } = req.params;

	try {
		const notification = await Notification.findById(requestId);

		if (!notification) {
			console.warn(`❌ No notification found for ID: ${requestId}`);
			return res.status(404).json({
				success: false,
				message: 'Notification not found for this request.',
			});
		}

		console.log(`✅ Notification found:`, notification);

		// Ensure notification is an object and has expected properties
		if (!notification.status) {
			console.error(`❌ Notification status is missing:`, notification);
			return res.status(500).json({
				success: false,
				message: 'Notification data is incomplete.',
			});
		}

		res.status(200).json({
			success: true,
			data: {
				status: notification.status,
				message: notification.message,
			},
		});
	} catch (error) {
		console.error(`❌ Server error fetching notification status:`, error);
		res.status(500).json({
			success: false,
			message: 'Internal server error fetching notification status.',
			error: error.message,
		});
	}
});

export const updateNotification = asyncHandler(async (req, res, next) => {
	const { requestId, transactionHash } = req.body;

	try {
		// Find the Notification by requestId and update it with the transactionHash
		const updatedNotification = await Notification.findByIdAndUpdate(
			requestId,
			{ transactionHash },
			{ new: true } // Return the updated document
		);

		if (!updatedNotification) {
			return res
				.status(404)
				.json({ success: false, message: 'Notification not found' });
		}

		res.status(200).json({ success: true, data: updatedNotification });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
	const { notificationId } = req.params;

	const notification = await Notification.findById(notificationId);
	if (!notification) {
		return next(new ErrorResponse('Notification not found', 404));
	}

	notification.isRead = true;
	await notification.save();

	res.status(200).json({
		success: true,
		data: notification,
	});
});
