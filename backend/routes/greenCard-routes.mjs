import express from 'express';
import { addGreenCard, downloadGreenCard } from '../controllers/greenCard-controller.mjs';
import { protect } from '../middleware/authorization.mjs';
import { setGridFS } from '../middleware/gfs.mjs';

const router = express.Router();

router.use(setGridFS);

router.route('/addGreenCard').post(protect, addGreenCard)
router.route('/verification/:fileId').get(downloadGreenCard);

export default router;