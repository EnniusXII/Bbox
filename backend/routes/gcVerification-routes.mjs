import express from 'express';
import {
	verifyGreenCard,
	approveGreenCardVerification,
	declineGreenCardVerification,
	getGreenCardVerificationStatus,
} from '../controllers/verification-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/verify').post(verifyGreenCard);
router.route('/approve/:requestId').post(protect, approveGreenCardVerification);
router.route('/decline/:requestId').post(protect, declineGreenCardVerification);
router.route('/status/:requestId').get(protect, getGreenCardVerificationStatus);

export default router;
