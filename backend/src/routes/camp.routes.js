import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createCamp, getCamps, registerForCamp } from "../controllers/campController.js";

const router = express.Router();

router.route("/")
    .post(protect, createCamp)
    .get(getCamps); // Publicly viewable

router.route("/:id/register")
    .post(protect, registerForCamp);

export default router;
