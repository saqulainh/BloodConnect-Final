import express from "express";
import {
  getHospitals,
  getHospitalCities,
  getHospitalById,
  updateHospitalStock,
} from "../controllers/hospitalController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getHospitals);
router.get("/cities", getHospitalCities);
router.get("/:id", getHospitalById);
router.patch("/:id/stock", protect, admin, updateHospitalStock);

export default router;
