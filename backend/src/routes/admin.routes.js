import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { adminLimiter } from "../middleware/rateLimiter.js";
import { requireAdminApiKey } from "../middleware/adminApiKeyMiddleware.js";
import {
    getAdminDashboard,
    getAllUsers,
    updateUser,
    deleteUser,
    toggleBanUser,
    promoteUser,
    getAllRequests,
    updateRequest,
    deleteRequest,
    forceFulfillRequest,
    getAdminCamps,
    createCamp,
    updateCamp,
    deleteCamp,
    getSystemHealth,
    sendBroadcast,
    getRevenueDetails,
    getAuditLogs,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes: API key → JWT → isAdmin role → rate limit
// Layer 1: requireAdminApiKey — secret X-Admin-Key header (stops stolen JWTs)
// Layer 2: protect — valid JWT
// Layer 3: isAdmin — role check in DB
// Layer 4: adminLimiter — rate limiting
router.use(requireAdminApiKey, protect, isAdmin, adminLimiter);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// User Management
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/ban", toggleBanUser);
router.patch("/users/:id/promote", promoteUser);

// Request Operations
router.get("/requests", getAllRequests);
router.patch("/requests/:id", updateRequest);
router.delete("/requests/:id", deleteRequest);
router.post("/requests/:id/fulfill", forceFulfillRequest);

// Camp Management
router.get("/camps", getAdminCamps);
router.post("/camps", createCamp);
router.patch("/camps/:id", updateCamp);
router.delete("/camps/:id", deleteCamp);

// System Health
router.get("/system-health", getSystemHealth);

// Broadcast
router.post("/broadcast", sendBroadcast);

// Revenue
router.get("/revenue", getRevenueDetails);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

export default router;
