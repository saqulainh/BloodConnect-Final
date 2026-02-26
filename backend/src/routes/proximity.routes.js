import express from "express";
import { getNearbyDonors } from "../controllers/proximityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/v1/proximity/donors?lat=&lng=&bloodGroup=&radius=
router.get("/donors", protect, getNearbyDonors);

export default router;
