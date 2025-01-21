import express from "express";
import { addDriversLicense, getDriversLicenses } from "../controllers/license-controller.mjs";
import { protect } from "../middleware/authorization.mjs";

const router = express.Router();

router.route("/addDriversLicense").post(protect, addDriversLicense);
router.route("/getDriversLicense").get(protect, getDriversLicenses);

export default router;