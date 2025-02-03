import express from 'express';
import { addGreenCard, confirmGreenCard, downloadGreenCard, verifyGreenCard } from '../controllers/greenCard-controller.mjs';
import { protect } from '../middleware/authorization.mjs';
import { setGridFS } from '../middleware/gfs.mjs';

const router = express.Router();

router.use(setGridFS);

router.route('/addGreenCard').post(protect, addGreenCard);
router.route('/confirmGreenCard').post(protect, confirmGreenCard)
router.route('/verification/:fileId').get(downloadGreenCard);
router.route('/verify/:insuranceId').get(verifyGreenCard)

export default router;