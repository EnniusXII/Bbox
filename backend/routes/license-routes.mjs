import express from 'express';
import {
	addDriversLicense,
	getDriversLicenses,
} from '../controllers/license-controller.mjs';
import { updateLicenseNFT } from '../controllers/licenseNFT-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/addDriversLicense').post(protect, addDriversLicense);
router.route('/getDriversLicense').get(protect, getDriversLicenses);

router.route('/update-nft/:licenseId').patch(protect, updateLicenseNFT);

export default router;
