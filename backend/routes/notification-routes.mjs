import express from 'express';
import { getNotifications, getNotificationStatus, markNotificationAsRead, updateNotification } from '../controllers/notification-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/updateNotification').post(updateNotification);
router.route('/:notificationId/read').put(protect, markNotificationAsRead);
router.route('/:requestId').get(getNotificationStatus);

export default router;