import logger from "../utils/logger.js";

/**
 * Middleware to log request durations and track slow APIs
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Once the response finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        const msg = `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`;

        // If it took longer than 500ms, log a warning
        if (duration > 500) {
            logger.warn(`SLOW API: ${msg}`);
        } else {
            // General info log for other requests (only if you want to log everything - usually noisy)
            // logger.info(msg); 
        }
    });

    next();
};

/**
 * Global Error Handling Middleware using Winston
 */
export const errorLogger = (err, req, res, next) => {
    // Log the error using Winston
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\n${err.stack}`);

    // Fallback to console string for local dev (if needed, though winston handles it)
    if (process.env.NODE_ENV !== "production" && !winstonHandlesDev) {
        console.error("Unhandled Error:", err);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "An unexpected server error occurred."
    });
};
