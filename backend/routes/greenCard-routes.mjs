import express from "express";
import { addGreenCard, getGreenCards } from "../controllers/greenCard-controller.mjs";
import { generateGreenCardNFT, verifyGreenCard } from "../controllers/greenCardNFTController.mjs";
import { protect } from "../middleware/authorization.mjs"; // Middleware to protect routes

const router = express.Router();

// Routes
router.post("/addGreenCard", protect, addGreenCard);
router.get("/getGreenCards", protect, getGreenCards);

router.post("/nft/:greenCardId", protect, generateGreenCardNFT);

// Route to Verify Green Card NFT
router.get("/verify/:hash", verifyGreenCard);

export default router;