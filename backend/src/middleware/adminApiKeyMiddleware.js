/**
 * ═══════════════════════════════════════════════════════════════════
 * Admin API Key Middleware
 * ═══════════════════════════════════════════════════════════════════
 * 
 * WHY THIS EXISTS:
 * JWT tokens can be stolen from localStorage/cookies via XSS attacks.
 * Even if an attacker gets a valid admin JWT, they still need the
 * secret API key (sent as a custom header) to access admin routes.
 * 
 * This is a "defense in depth" approach — two independent secrets
 * must be compromised simultaneously for an admin breach.
 * 
 * HOW TO USE:
 * 1. Set ADMIN_API_KEY in your .env file (generate a random 64-char hex)
 * 2. Apply this middleware BEFORE protect on admin-only routes
 * 3. The client must send header: X-Admin-Key: <your-key>
 * 
 * SETUP (generate a secure key):
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * ═══════════════════════════════════════════════════════════════════
 */

import crypto from "node:crypto";

/**
 * Middleware: Validates the X-Admin-Key request header.
 * Uses timing-safe comparison to prevent timing-based key guessing.
 */
export const requireAdminApiKey = (req, res, next) => {
    const adminApiKey = process.env.ADMIN_API_KEY;
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;

    // If neither key is configured, deny all access (fail secure)
    if (!adminApiKey && !adminSecretKey) {
        console.error("[SECURITY] Neither ADMIN_API_KEY nor ADMIN_SECRET_KEY is set. Admin access denied.");
        return res.status(503).json({
            success: false,
            message: "Admin service is not configured. Contact the system administrator.",
        });
    }

    const provided = req.headers["x-admin-key"];

    if (!provided) {
        return res.status(401).json({
            success: false,
            message: "Admin API key missing. Set the X-Admin-Key header.",
        });
    }

    // ── Timing-Safe Comparison ────────────────────────────────────────
    // Regular string comparison (===) leaks timing info:
    // "wrong" short keys fail faster than "almost right" long ones.
    // An attacker can use this to guess the key byte-by-byte.
    // crypto.timingSafeEqual() always takes the same time regardless.
    try {
        const providedBuf = Buffer.from(provided, "utf8");

        const matchesKey = (candidate) => {
            if (!candidate) return false;
            const candidateBuf = Buffer.from(candidate, "utf8");
            if (candidateBuf.length !== providedBuf.length) return false;
            return crypto.timingSafeEqual(candidateBuf, providedBuf);
        };

        const isValid = matchesKey(adminApiKey) || matchesKey(adminSecretKey);

        if (!isValid) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin API key.",
            });
        }

        // Key is valid — proceed to the next middleware (usually: protect + isAdmin)
        next();
    } catch {
        return res.status(403).json({
            success: false,
            message: "Invalid admin API key.",
        });
    }
};
