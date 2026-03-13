import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// Cache analytics response for 60 seconds since it's an expensive query
router.get("/", protect, cacheMiddleware(60), getAnalytics);

export default router;
