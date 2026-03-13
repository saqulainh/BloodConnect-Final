import express from "express";
import { getMissionStats } from "../controllers/adminAnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { requireAdminApiKey } from "../middleware/adminApiKeyMiddleware.js";

const router = express.Router();

// GET /api/v1/admin/mission-stats — Admin only (API key + JWT + role check)
router.get("/mission-stats", requireAdminApiKey, protect, isAdmin, getMissionStats);

export default router;
