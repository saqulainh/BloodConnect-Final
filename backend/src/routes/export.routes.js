import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { exportUsersData, exportRequestsData } from "../controllers/exportController.js";

const router = express.Router();

// Apply auth and admin middleware to all export routes
router.use(protect, admin);

router.get("/users", exportUsersData);
router.get("/requests", exportRequestsData);

export default router;
