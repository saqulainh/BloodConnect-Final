import express from "express";
import { sendMessage, getMessages, getConversations } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all chat routes
router.use(protect);

router.post("/send/:id", sendMessage);
router.get("/history/:id", getMessages);
router.get("/conversations", getConversations);

export default router;
