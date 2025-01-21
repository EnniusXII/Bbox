import Notification from '../models/NotificationSchema.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const getNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId, isRead: false });

    res.status(200).json({
        success: true,
        data: notifications
    });
});

export const getNotificationStatus = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;  // Assuming requestId is passed in URL params

    console.log("Fetching notification status for requestId:", requestId);  // Debugging log

    const notification = await Notification.findById(requestId);

    if (!notification) {
        return next(new ErrorResponse('Notification not found for this request', 404));
    }

    // Return the current status of the notification
    res.status(200).json({
        success: true,
        data: {
            isAccepted: notification.status === 'approved',
            isDeclined: notification.status === 'declined',
            status: notification.status
        }
    });
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
        return res.status(404).json({ success: false, message: "Notification not found" });
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
        data: notification
    });
});