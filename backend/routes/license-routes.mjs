import express from "express";
import { addDriversLicense, getDriversLicenses, getLicenseData } from "../controllers/license-controller.mjs";
import { protect } from "../middleware/authorization.mjs";

const router = express.Router();

router.route("/addDriversLicense").post(protect, addDriversLicense);
router.route("/getDriversLicense").get(protect, getDriversLicenses);
router.route("/getLicenseData").post(protect, getLicenseData);

export default router;