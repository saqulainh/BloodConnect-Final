import express from "express";
import { getInventory, updateInventory } from "../controllers/inventoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getInventory);
router.put("/:id", protect, admin, updateInventory);

export default router;
