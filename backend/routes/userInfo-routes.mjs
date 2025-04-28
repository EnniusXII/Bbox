import express from 'express';
import {
	getUserInfo,
	updateUserInfo,
} from '../controllers/userInfo-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/').get(protect, getUserInfo);
router.route('/update').put(protect, updateUserInfo);

export default router;
