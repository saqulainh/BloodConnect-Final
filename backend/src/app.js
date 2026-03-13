import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import { globalLimiter, adminLimiter } from "./middleware/rateLimiter.js";
import { requestLogger, errorLogger } from "./middleware/loggerMiddleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import campRoutes from "./routes/camp.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.routes.js";
import proximityRoutes from "./routes/proximity.routes.js";
import sosRoutes from "./routes/sos.routes.js";
import healthWalletRoutes from "./routes/healthWallet.routes.js";
import mapRoutes from "./routes/map.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import receiverRoutes from "./routes/receiver.routes.js";
import exportRoutes from "./routes/export.routes.js";
import { handleWebhook } from "./controllers/paymentController.js";
import mongoose from "mongoose";

const app = express();

// ═══════════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE (order matters!)
// ═══════════════════════════════════════════════════════════════════

// Request logger for response times
app.use(requestLogger);

// 1. Helmet — sets 15+ HTTP security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Allow inline scripts for dev
}));

// 2. Response compression — gzip (60-80% smaller payloads)
app.use(compression());

// 3. Global rate limit — 100 req/min per IP (DDoS protection)
app.use("/api/", globalLimiter);

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
];

// CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ⚠️ Webhook MUST be registered BEFORE express.json()
// Razorpay webhook needs raw body for HMAC signature verification
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), handleWebhook);

// General Middleware
app.use(express.json({ limit: "10kb" }));          // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 4. NoSQL Injection Protection — strips $ and . from user input
app.use(mongoSanitize());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminAnalyticsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/camps", campRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/proximity", proximityRoutes);
app.use("/api/v1/sos", sosRoutes);
app.use("/api/v1/health-wallet", healthWalletRoutes);
app.use("/api/v1/map", mapRoutes);
app.use("/api/v1/receiver", receiverRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/export", exportRoutes);

// Health Check
app.get("/health", (req, res) => {
    const healthCheck = {
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now(),
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        memory: process.memoryUsage(),
    };

    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.status = "error";
        healthCheck.error = error.message;
        res.status(503).json(healthCheck); // 503 Service Unavailable
    }
});

app.get("/", (req, res) => {
    res.send("BloodConnect API is running...");
});

// Global Error Handler via Winston
app.use(errorLogger);

export default app;
