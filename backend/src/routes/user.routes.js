import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateMe, getDonors } from "../controllers/userController.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

router.patch("/update-me", protect, updateMe);

// Cache search queries for 30s to easily scale high concurrency searches
router.get("/donors", protect, cacheMiddleware(30), getDonors);

export default router;
