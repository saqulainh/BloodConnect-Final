/**
 * ═══════════════════════════════════════════════════════════════════
 * BloodConnect — Isolated Background Worker Microservice Entry Point
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This file runs ALL background scheduled tasks in an isolated process,
 * completely separated from the main API server.
 * 
 * WHY SEPARATE?
 * - Heavy DB batch queries (scanning thousands of requests) won't
 *   starve the Event Loop that serves real-time HTTP API traffic.
 * - Can be independently scaled (e.g. 1 worker vs 4 API replicas).
 * - If the worker crashes, the API stays online serving users.
 * - In Docker/K8s, this runs as its own container/pod.
 */

import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import cron from "node-cron";
import { connectDB } from "./src/config/db.js";
import Request from "./src/models/Request.js";
import { calculateUrgency } from "./src/services/urgencyEngine.js";
import { triggerEIMS, triggerGlobal } from "./src/services/pusherService.js";
import { startBloodMatchWorker } from "./src/workers/bloodMatchWorker.js";

console.log("═══════════════════════════════════════════════════════");
console.log("  🔧 BloodConnect Background Worker Microservice");
console.log("  PID:", process.pid);
console.log("═══════════════════════════════════════════════════════");

// Connect to the database
connectDB().then(() => {
    console.log("[WORKER] Connected to MongoDB. Starting scheduled tasks...\n");

    // ─── Task 1: AI Urgency Auto-Recalculation (Every 5 mins) ──────
    cron.schedule("*/5 * * * *", async () => {
        if (mongoose.connection.readyState !== 1) return;
        try {
            console.log("[URGENCY CRON] Recalculating Urgency Scores...");
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
            if (updatedCount > 0) console.log(`[URGENCY CRON] Done. ${updatedCount} requests updated.`);
        } catch (err) {
            console.error("[URGENCY CRON] Error:", err.message);
        }
    });

    // ─── Task 2: Automated Blood Matching Worker (Every 30 mins) ───
    startBloodMatchWorker();

    console.log("[WORKER] All cron jobs registered and running.");
}).catch((err) => {
    console.error("[WORKER] Fatal: Could not connect to DB:", err.message);
    process.exit(1);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────
const shutdown = (signal) => {
    console.log(`\n[${signal}] Shutting down worker gracefully...`);
    mongoose.connection.close(false).then(() => {
        console.log("[WORKER] MongoDB connection closed.");
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
