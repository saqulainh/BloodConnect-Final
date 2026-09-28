import express from "express";
import { assistEmergency } from "../controllers/aiController.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/emergency-assist", aiLimiter, assistEmergency);

export default router;
