import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import { handleWebhook } from "./controllers/paymentController.js";

const app = express();

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));

// ⚠️ Webhook MUST be registered BEFORE express.json()
// Razorpay webhook needs raw body for HMAC signature verification
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), handleWebhook);

// General Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/requests", requestRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminAnalyticsRoutes);
app.use("/api/v1/camps", campRoutes);
app.use("/api/v1/donations", donationRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/proximity", proximityRoutes);
app.use("/api/v1/sos", sosRoutes);

// Health Check
app.get("/", (req, res) => {
    res.send("API is running...");
});

export default app;
