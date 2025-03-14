import express from 'express';
import {
	getGreenCardNotifications,
	getGreenCardNotificationStatus,
	markGreenCardNotificationAsRead,
	updateGreenCardNotification,
} from '../controllers/gcNotification-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/').get(protect, getGreenCardNotifications);
router.route('/updateNotification').post(updateGreenCardNotification);
router
	.route('/:notificationId/read')
	.put(protect, markGreenCardNotificationAsRead);
router.route('/:requestId').get(protect, getGreenCardNotificationStatus);

export default router;
