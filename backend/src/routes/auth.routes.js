import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyOtp,
    resendOtp,
    verifyAadhaar,
    getMe
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { upload } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/register", upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
]), registerUser);

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-aadhaar", verifyAadhaar);
router.get("/me", protect, getMe);

export default router;
