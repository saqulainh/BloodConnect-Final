import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Placeholder for user routes
router.get("/", protect, (req, res) => {
    res.json({ message: "User routes working" });
});

export default router;
