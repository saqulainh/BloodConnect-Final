import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getHealthWalletStats, fitnessCheck, logDonationHW } from "../controllers/healthWallet.controller.js";

const router = express.Router();

// All routes are protected — JWT required
router.get("/stats", protect, getHealthWalletStats);
router.post("/fitness-check", protect, fitnessCheck);
router.post("/log-donation", protect, logDonationHW);

export default router;
