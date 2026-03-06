import express from "express";
import { getNearbyDonors, getActiveMapRequests } from "../controllers/mapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base route: /api/v1/map
router.get("/nearby-donors", protect, getNearbyDonors);
router.get("/active-requests", protect, getActiveMapRequests);

export default router;
