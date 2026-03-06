import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getReceiverStats,
    getMyRequests,
    getReceiverWalletStats,
    getReceiverAnalytics,
    sendGratitude,
    getRequestTimeline,
} from "../controllers/receiverController.js";

const router = express.Router();

router.get("/stats", protect, getReceiverStats);
router.get("/my-requests", protect, getMyRequests);
router.get("/wallet", protect, getReceiverWalletStats);
router.get("/analytics", protect, getReceiverAnalytics);
router.post("/gratitude", protect, sendGratitude);
router.get("/timeline/:requestId", protect, getRequestTimeline);

export default router;
