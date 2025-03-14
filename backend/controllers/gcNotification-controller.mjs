import GreenCardNotification from '../models/GreeenCardNotificationSchema.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const getGreenCardNotifications = asyncHandler(
	async (req, res, next) => {
		const userId = req.user.id;

		const notifications = await GreenCardNotification.find({
			user: userId,
			isRead: false,
		});

		res.status(200).json({
			success: true,
			data: notifications,
		});
	}
);

export const getGreenCardNotificationStatus = asyncHandler(
	async (req, res, next) => {
		const { requestId } = req.params;

		const notification = await GreenCardNotification.findById(requestId);

		if (!notification) {
			console.warn(
				`❌ No Green Card Notification found for ID: ${requestId}`
			);
			return res.status(404).json({
				success: false,
				message: 'Green Card notification not found.',
			});
		}

		res.status(200).json({
			success: true,
			data: {
				status: notification.status,
				message: notification.message,
				owner: notification.owner,
			},
		});
	}
);

export const updateGreenCardNotification = asyncHandler(
	async (req, res, next) => {
		const { requestId, transactionHash } = req.body;

		try {
			const updatedNotification =
				await GreenCardNotification.findByIdAndUpdate(
					requestId,
					{ transactionHash },
					{ new: true }
				);

			if (!updatedNotification) {
				return res.status(404).json({
					success: false,
					message: 'Notification not found',
				});
			}

			res.status(200).json({ success: true, data: updatedNotification });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}
);

export const markGreenCardNotificationAsRead = asyncHandler(
	async (req, res, next) => {
		const { notificationId } = req.params;

		const notification = await GreenCardNotification.findById(
			notificationId
		);
		if (!notification) {
			return next(new ErrorResponse('Notification not found', 404));
		}

		notification.isRead = true;
		await notification.save();

		res.status(200).json({
			success: true,
			data: notification,
		});
	}
);
