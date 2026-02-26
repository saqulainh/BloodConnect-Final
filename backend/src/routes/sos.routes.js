import express from "express";
import { broadcastSOS, getActiveSOSAlerts } from "../controllers/sosController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/v1/sos/broadcast — Send emergency alert to nearby donors
router.post("/broadcast", protect, broadcastSOS);

// GET /api/v1/sos/active — Get active critical requests (last 12h)
router.get("/active", protect, getActiveSOSAlerts);

export default router;
