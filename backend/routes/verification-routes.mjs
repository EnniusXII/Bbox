import express from "express";
import { approveLicenseVerification, declineLicenseVerification, getVerificationStatus, recordVerification, verifyDriverLicense } from "../controllers/verification-controller.mjs";
import { protect } from "../middleware/authorization.mjs";

const router = express.Router();

router.route("/").post(verifyDriverLicense);
router.route("/approve/:requestId").post(protect, approveLicenseVerification);
router.route("/decline/:requestId").post(protect, declineLicenseVerification);
router.route("/record-verification").post(protect, recordVerification);
router.route("/verification-status/:requestId").get(protect, getVerificationStatus);

export default router;