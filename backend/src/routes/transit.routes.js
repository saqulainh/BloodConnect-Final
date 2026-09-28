import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTransit,
  getAvailableTransits,
  acceptTransit,
  verifyPickup,
  updateLocationAndTemp,
  verifyDelivery,
  getActiveTransit,
  getTransitById,
} from "../controllers/transitController.js";

const router = express.Router();

// All transit routes require authentication
router.use(protect);

// Transit creation & queries
router.post("/", createTransit);
router.get("/active", getActiveTransit);
router.get("/available", getAvailableTransits);
router.get("/:id", getTransitById);

// Transit lifecycle transitions
router.patch("/:id/accept", acceptTransit);
router.patch("/:id/pickup", verifyPickup);
router.patch("/:id/location", updateLocationAndTemp);
router.patch("/:id/deliver", verifyDelivery);

export default router;
