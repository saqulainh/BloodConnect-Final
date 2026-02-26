import express from "express";
import { getMissionStats } from "../controllers/adminAnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/v1/admin/mission-stats — Admin only
router.get("/mission-stats", protect, getMissionStats);

export default router;
