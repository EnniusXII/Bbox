import express from 'express';
import { addGreenCard, confirmGreenCard, downloadGreenCard, verifyGreenCard } from '../controllers/greenCard-controller.mjs';
import { protect } from '../middleware/authorization.mjs';
import { setGridFS } from '../middleware/gfs.mjs';

const router = express.Router();

router.use(setGridFS);

router.route('/create').post(protect, addGreenCard);
router.route('/confirm').post(protect, confirmGreenCard)
router.route('/download/:fileId').get(downloadGreenCard);
router.route('/verify').post(verifyGreenCard)

export default router;