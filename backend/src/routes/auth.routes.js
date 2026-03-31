import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    verifyOtp,
    resendOtp,
    verifyAadhaar,
    getMe,
    forgotPassword,
    resetPassword,
    adminLogin,
    changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";
import { authLimiter, adminLoginLimiter, otpLimiter, userFingerprintLimiter } from "../middleware/rateLimiter.js";
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", authLimiter, upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
]), validateRegister, registerUser);

router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
// OTP endpoints: must be rate-limited — brute forcing a 6-digit OTP
// without limits would take seconds across 1M combinations
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/verify-aadhaar", protect, verifyAadhaar);
router.get("/me", protect, getMe);

// ── Password Recovery & Change ─────────────────────────────────
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/change-password", protect, userFingerprintLimiter, changePassword);

// ── Admin Login (Secret Key Required) ──────────────────────────
router.post("/admin-login", adminLoginLimiter, adminLogin);

export default router;


