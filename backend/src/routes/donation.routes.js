import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addDonation, getMyDonations } from "../controllers/donationController.js";

const router = express.Router();

router.route("/")
    .post(protect, addDonation);

router.route("/my-donations")
    .get(protect, getMyDonations);

export default router;
