import rateLimit from "express-rate-limit";

// ── Blood Request Rate Limiter ────────────────────────────────────────
// Max 10 blood requests per 15 minutes per IP to prevent spam
export const requestCreationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: "Too many blood requests created from this IP. Please wait 15 minutes before trying again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── SOS Broadcast Rate Limiter ────────────────────────────────────────
// Max 5 SOS broadcasts per hour per IP to prevent abuse
export const sosLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: "Too many SOS broadcasts from this IP. This limit exists to prevent false alarms. Please wait before trying again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Auth Rate Limiter ─────────────────────────────────────────────────
// Max 20 auth attempts per 15 minutes per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Global API Rate Limiter ───────────────────────────────────────────
// Max 100 requests per minute per IP — DDoS protection
export const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Admin Rate Limiter ────────────────────────────────────────────────
// Max 30 requests per minute per IP — admin routes are sensitive
export const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: "Too many admin requests. Please wait before trying again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Admin Login Rate Limiter ──────────────────────────────────────────
// Max 5 admin login attempts per 15 minutes per IP — extra restrictive
export const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many admin login attempts. Account protection active. Try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── OTP Rate Limiter ──────────────────────────────────────────────────
// Max 5 OTP verify/resend attempts per 15 minutes per IP
// Prevents OTP brute-force: 6-digit OTP = 1M combos, but without this
// limit an attacker can try all combinations in seconds.
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many OTP attempts. Please wait 15 minutes before trying again.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── User + IP Fingerprint Limiter ─────────────────────────────────────
// IP-only rate limits can be bypassed with a VPN rotation.
// This limiter combines the authenticated user's MongoDB _id AND their IP
// as a composite key — switching VPN does NOT help since the account ID
// remains the same. Apply on sensitive authenticated endpoints.
export const userFingerprintLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 30,
    keyGenerator: (req) => {
        const userId = req.user?._id?.toString() || "anon";
        return `${userId}:${req.ip}`;
    },
    message: {
        success: false,
        message: "Rate limit exceeded for your account. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
