import express from 'express';
import { addGreenCard, confirmGreenCard, downloadGreenCard, getGreenCard } from '../controllers/greenCard-controller.mjs';
import { generateGreenCardNFT, verifyGreenCard } from "../controllers/greenCardNFTController.mjs";
import { protect } from '../middleware/authorization.mjs';
import { setGridFS } from '../middleware/gfs.mjs';

const router = express.Router();

router.use(setGridFS);

router.route('/create').post(protect, addGreenCard);
router.route('/confirm').post(protect, confirmGreenCard)
router.route('/getGreenCard').get(protect, getGreenCard);
router.route('/download/:fileId').get(downloadGreenCard);


router.post("/nft/:greenCardId", protect, generateGreenCardNFT);

// Route to Verify Green Card NFT
router.get("/verify-nft/:hash", verifyGreenCard);

export default router;