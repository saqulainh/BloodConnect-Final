import express from "express";
import {
    createOrder,
    verifyPayment,
    downloadReceipt,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/:orderId/receipt", protect, downloadReceipt);
// Note: /webhook is registered directly in app.js BEFORE express.json() middleware

export default router;
