import { body, validationResult } from "express-validator";

// ── Run validation and return errors if any ───────────────────────────
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg, // Return first error for clean UX
            errors: errors.array(),
        });
    }
    next();
};

// ── Register Validation Rules ─────────────────────────────────────────
export const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required.")
        .isLength({ min: 2, max: 60 }).withMessage("Name must be between 2 and 60 characters."),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address."),
    body("password")
        .notEmpty().withMessage("Password is required.")
        // 8+ chars, uppercase, lowercase, number, special char
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.")
        .matches(/\d/).withMessage("Password must contain at least one number.")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character (!@#$%^&*)"),
    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required.")
        .matches(/^[6-9]\d{9}$/).withMessage("Please provide a valid 10-digit Indian mobile number."),
    body("bloodGroup")
        .notEmpty().withMessage("Blood group is required.")
        .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).withMessage("Invalid blood group. Must be one of A+, A-, B+, B-, AB+, AB-, O+, O-."),
    body("aadhaarNumber")
        .notEmpty().withMessage("Aadhaar number is required.")
        .matches(/^[2-9]\d{11}$/).withMessage("Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1."),
    handleValidationErrors,
];

// ── Login Validation Rules ────────────────────────────────────────────
export const validateLogin = [
    body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email."),
    body("password").notEmpty().withMessage("Password is required."),
    handleValidationErrors,
];

// ── Blood Request Validation Rules ────────────────────────────────────
export const validateBloodRequest = [
    body("patientName")
        .trim()
        .notEmpty().withMessage("Patient name is required.")
        .isLength({ min: 2, max: 100 }).withMessage("Patient name must be between 2 and 100 characters."),
    body("hospital")
        .trim()
        .notEmpty().withMessage("Hospital name is required."),
    body("bloodGroup")
        .notEmpty().withMessage("Blood group is required.")
        .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).withMessage("Invalid blood group."),
    body("urgency")
        .notEmpty().withMessage("Urgency level is required.")
        .isIn(["Normal", "Urgent", "Critical"]).withMessage("Urgency must be Normal, Urgent, or Critical."),
    body("units")
        .notEmpty().withMessage("Number of units is required.")
        .isInt({ min: 1, max: 20 }).withMessage("Units must be a number between 1 and 20."),
    handleValidationErrors,
];

// ── Forgot Password Validation ────────────────────────────────────────
export const validateForgotPassword = [
    body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email."),
    handleValidationErrors,
];

// ── Reset Password Validation ─────────────────────────────────────────
export const validateResetPassword = [
    body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email."),
    body("otp").trim().notEmpty().withMessage("OTP is required.").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits."),
    body("password")
        .notEmpty().withMessage("New password is required.")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.")
        .matches(/\d/).withMessage("Password must contain at least one number.")
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character."),
    handleValidationErrors,
];
// ── File Upload Validation ───────────────────────────────────────────────
// Server-side MIME type whitelist. Multer/Cloudinary check extension but
// a malicious client can spoof Content-Type — this double-checks at the
// middleware level before the file ever touches cloud storage.
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per file

export const validateFileUpload = (req, res, next) => {
    if (!req.files && !req.file) return next(); // No files — no problem

    const files = req.files
        ? Object.values(req.files).flat()
        : [req.file];

    for (const file of files) {
        // Check MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: `Invalid file type: "${file.mimetype}". Only JPEG, PNG, WebP, and PDF are allowed.`,
            });
        }
        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({
                success: false,
                message: `File "${file.originalname}" exceeds the 5MB size limit.`,
            });
        }
    }
    next();
};
