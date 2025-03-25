import express from 'express';
import {
	addDriversLicense,
	getDriversLicenses,
} from '../controllers/license-controller.mjs';
import {
	updateLicenseNFT,
	verifyLicense,
} from '../controllers/licenseNFT-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/addDriversLicense').post(protect, addDriversLicense);
router.route('/getDriversLicense').get(protect, getDriversLicenses);

router.route('/nft/:licenseId').patch(protect, updateLicenseNFT);

router.route('/verify-nft/:hash').get(verifyLicense);

export default router;
