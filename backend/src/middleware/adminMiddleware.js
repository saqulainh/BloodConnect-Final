import { protect } from "./authMiddleware.js";

/**
 * Admin-only middleware.
 * Must be used AFTER `protect` middleware.
 * Checks if the authenticated user has role === "admin".
 */
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated." });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
    }
    next();
};
