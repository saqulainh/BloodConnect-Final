import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { connectDB } from "./src/config/db.js";
import app from "./src/app.js";
import http from "http";
import cron from "node-cron";
import mongoose from "mongoose";
import Request from "./src/models/Request.js";
import { calculateUrgency } from "./src/services/urgencyEngine.js";
import { triggerEIMS, triggerGlobal } from "./src/services/pusherService.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// ── Keep-Alive for high load ─────────────────────────────────────────
server.keepAliveTimeout = 65 * 1000;    // 65s (must be > ALB idle timeout)
server.headersTimeout = 66 * 1000;      // 66s (must be > keepAliveTimeout)

// Background Cron Job: AI Urgency Auto-Recalculation (Runs every 5 mins)
cron.schedule("*/5 * * * *", async () => {
    try {
        console.log("[EIMS CRON] Recalculating Urgency Scores...");
        const activeRequests = await Request.find({ status: "Active" });

        let updatedCount = 0;
        for (const req of activeRequests) {
            const urgencyData = calculateUrgency(req);

            // Only update if score or level changed
            if (req.urgencyScore !== urgencyData.urgencyScore || req.urgencyLevel !== urgencyData.urgencyLevel) {
                req.urgencyScore = urgencyData.urgencyScore;
                req.urgencyLevel = urgencyData.urgencyLevel;
                await req.save();
                updatedCount++;

                // Emit update to Pusher so map markers scale/change color live
                triggerEIMS("requestUpdated", req);

                if (req.urgencyLevel === "critical") {
                    triggerGlobal("criticalAlert", req);
                }
            }
        }
        console.log(`[EIMS CRON] Finished. ${updatedCount} requests updated.`);
    } catch (err) {
        console.error("[EIMS CRON] Error recalculating urgency:", err);
    }
});

// Connect to Database first, then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});

// ── Graceful Shutdown ────────────────────────────────────────────────
const gracefulShutdown = (signal) => {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(() => {
        console.log("HTTP server closed.");
        mongoose.connection.close(false).then(() => {
            console.log("MongoDB connection closed.");
            process.exit(0);
        });
    });
    // Force exit if shutdown takes too long
    setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
