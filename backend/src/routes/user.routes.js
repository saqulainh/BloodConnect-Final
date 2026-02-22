import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateMe, getDonors } from "../controllers/userController.js";

const router = express.Router();

router.patch("/update-me", protect, updateMe);
router.get("/donors", protect, getDonors);

export default router;
