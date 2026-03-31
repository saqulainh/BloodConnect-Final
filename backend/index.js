import "dotenv/config";
import dns from "node:dns";
// BROAD DNS Fix for SRV records (supports multiple regions/ISPs)
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

import os from "node:os";
import cluster from "node:cluster";
import http from "http";
import mongoose from "mongoose";
import cron from "node-cron";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import Request from "./src/models/Request.js";
import { calculateUrgency } from "./src/services/urgencyEngine.js";
import { triggerEIMS, triggerGlobal } from "./src/services/pusherService.js";
import { startBloodMatchWorker } from "./src/workers/bloodMatchWorker.js";

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

// ─── CLUSTERING FOR HIGH LOAD SCALABILITY ─────────────────────────────
if (cluster.isPrimary) {
    console.log(`[CLUSTER] Primary Master process is running on PID: ${process.pid}`);
    console.log(`[CLUSTER] Forking API Server across ${numCPUs} logical CPU cores...`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Auto-restart dead workers
    cluster.on("exit", (worker, code, signal) => {
        console.warn(`[CLUSTER] Worker ${worker.process.pid} died (Code: ${code}). Booting a new worker...`);
        cluster.fork();
    });

    // ── Execute Background Scheduled Cron Jobs ONLY on Primary Node ────
    console.log(`[CRON] Starting background workers exclusively on Master Primary Node.`);

    // 1. Background Cron Job: AI Urgency Auto-Recalculation (Runs every 5 mins)
    cron.schedule("*/5 * * * *", async () => {
        // Only run if DB is connected
        if (mongoose.connection.readyState !== 1) return;
        try {
            console.log("[EIMS CRON] Recalculating Urgency Scores...");
            const activeRequests = await Request.find({ status: "Active" });

            let updatedCount = 0;
            for (const req of activeRequests) {
                const urgencyData = calculateUrgency(req);
                if (req.urgencyScore !== urgencyData.urgencyScore || req.urgencyLevel !== urgencyData.urgencyLevel) {
                    req.urgencyScore = urgencyData.urgencyScore;
                    req.urgencyLevel = urgencyData.urgencyLevel;
                    await req.save();
                    updatedCount++;

                    triggerEIMS("requestUpdated", req);
                    if (req.urgencyLevel === "critical") triggerGlobal("criticalAlert", req);
                }
            }
            if (updatedCount > 0) console.log(`[EIMS CRON] Finished. ${updatedCount} requests updated.`);
        } catch (err) {
            console.error("[EIMS CRON] Error recalculating urgency:", err);
        }
    });

    // 2. Automated Urgent Match Worker
    connectDB().then(() => {
        startBloodMatchWorker();
    });

} else {
    // ─── WORKER PROCESSES: Handle incoming HTTP Traffic ────────────────

    const server = http.createServer(app);

    // Keep-Alive connection timeout headers for preventing load balancer 504s under heavy load
    server.keepAliveTimeout = 65 * 1000;
    server.headersTimeout = 66 * 1000;

    // Connect to Database first, then start server
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`[WORKER] API Process ${process.pid} running on port ${PORT}`);
        });
    });

    // Graceful Shutdown specific to the worker
    const gracefulShutdown = (signal) => {
        console.log(`\n[${signal}] Shutting down worker ${process.pid} gracefully...`);
        server.close(() => {
            mongoose.connection.close(false).then(() => {
                process.exit(0);
            });
        });
        setTimeout(() => process.exit(1), 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
