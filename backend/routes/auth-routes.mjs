import express from "express";
import { register, login, getMe } from "../controllers/auth-controller.mjs";
import { protect } from "../middleware/authorization.mjs";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, getMe);

export default router;
