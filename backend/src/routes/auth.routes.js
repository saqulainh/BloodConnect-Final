import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyOtp,
    resendOtp,
    verifyAadhaar,
    getMe,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { upload } from "../utils/cloudinary.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", authLimiter, upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
]), validateRegister, registerUser);

router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-aadhaar", verifyAadhaar);
router.get("/me", protect, getMe);

// ── Password Recovery ──────────────────────────────────────────
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

export default router;

