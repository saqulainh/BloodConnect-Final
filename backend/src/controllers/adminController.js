import User from "../models/User.js";
import Request from "../models/Request.js";
import Donation from "../models/Donation.js";
import Payment from "../models/Payment.js";
import AuditLog from "../models/AuditLog.js";
import Camp from "../models/Camp.js";
import mongoose from "mongoose";
import os from "os";
import { triggerNotification } from "../services/notificationService.js";

// ── Helper: log admin action ─────────────────────────────────────────────
const logAction = async (adminId, action, targetType, targetId, details = "", meta = {}) => {
    try {
        await AuditLog.create({ admin: adminId, action, targetType, targetId, details, meta });
    } catch (err) {
        console.error("Audit log error:", err.message);
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  1. ADMIN DASHBOARD OVERVIEW
// ═════════════════════════════════════════════════════════════════════════

export const getAdminDashboard = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalDonors,
            totalReceivers,
            totalAdmins,
            totalRequests,
            activeRequests,
            fulfilledRequests,
            todayRegistrations,
            weekRegistrations,
            totalRevenue,
            todayRevenue,
            totalDonations,
            totalCamps,
            recentAuditLogs,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "donor" }),
            User.countDocuments({ role: "receiver" }),
            User.countDocuments({ role: "admin" }),
            Request.countDocuments(),
            Request.countDocuments({ status: "Active" }),
            Request.countDocuments({ status: "Completed" }),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Payment.aggregate([
                { $match: { status: "success" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Payment.aggregate([
                { $match: { status: "success", createdAt: { $gte: todayStart } } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            Donation.countDocuments(),
            Camp.countDocuments(),
            AuditLog.find().sort({ createdAt: -1 }).limit(5).populate("admin", "name email"),
        ]);

        // Registration trend (last 7 days)
        const registrationTrend = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", users: "$count" } },
        ]);

        const fulfillmentRate = totalRequests > 0
            ? Math.round((fulfilledRequests / totalRequests) * 100) : 0;

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, donors: totalDonors, receivers: totalReceivers, admins: totalAdmins },
                requests: { total: totalRequests, active: activeRequests, fulfilled: fulfilledRequests, fulfillmentRate },
                registrations: { today: todayRegistrations, thisWeek: weekRegistrations, trend: registrationTrend },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    today: todayRevenue[0]?.total || 0,
                },
                totalDonations,
                totalCamps,
                recentAuditLogs,
            },
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  2. USER MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════

// GET /admin/users — paginated, filterable list
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, bloodGroup, city, search, sort = "-createdAt" } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (bloodGroup) filter.bloodGroup = bloodGroup;
        if (city) filter.city = { $regex: city, $options: "i" };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find(filter)
                .select("-password -otp -otpExpires")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/users/:id — update user profile/role
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Prevent modifying sensitive fields via this endpoint
        delete updates.password;
        delete updates.otp;
        delete updates.otpExpires;
        delete updates.aadhaarNumber;  // Must go through pre-save hook for encryption

        const user = await User.findByIdAndUpdate(id, updates, { new: true })
            .select("-password -otp -otpExpires");

        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        await logAction(req.user._id, "USER_UPDATED", "User", user._id,
            `Updated user ${user.name} (${user.email})`, { changes: Object.keys(updates) });

        res.json({ success: true, data: user, message: "User updated successfully." });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/users/:id — delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "Cannot delete your own admin account." });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        await logAction(req.user._id, "USER_DELETED", "User", user._id,
            `Deleted user ${user.name} (${user.email})`);

        res.json({ success: true, message: `User ${user.name} deleted.` });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/users/:id/ban — toggle ban
export const toggleBanUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "Cannot ban yourself." });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        user.isBanned = !user.isBanned;
        await user.save();

        const action = user.isBanned ? "USER_BANNED" : "USER_UNBANNED";
        await logAction(req.user._id, action, "User", user._id,
            `${action === "USER_BANNED" ? "Banned" : "Unbanned"} user ${user.name}`);

        res.json({
            success: true,
            message: `User ${user.name} ${user.isBanned ? "banned" : "unbanned"}.`,
            data: { isBanned: user.isBanned },
        });
    } catch (error) {
        console.error("Ban User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/users/:id/promote — promote to admin / demote
export const promoteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // "admin", "donor", or "receiver"

        if (!["admin", "donor", "receiver"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role." });
        }

        if (id === req.user._id.toString() && role !== "admin") {
            return res.status(400).json({ success: false, message: "Cannot demote yourself." });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true })
            .select("-password -otp -otpExpires");

        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        await logAction(req.user._id, "USER_ROLE_CHANGED", "User", user._id,
            `Changed ${user.name} role to ${role}`);

        res.json({ success: true, data: user, message: `${user.name} is now ${role}.` });
    } catch (error) {
        console.error("Promote User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  3. BLOOD REQUEST OPERATIONS
// ═════════════════════════════════════════════════════════════════════════

// GET /admin/requests — all requests, paginated
export const getAllRequests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, urgency, bloodGroup, sort = "-createdAt" } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;
        if (bloodGroup) filter.bloodGroup = bloodGroup;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [requests, total] = await Promise.all([
            Request.find(filter)
                .populate("requester", "name email bloodGroup phone")
                .populate("fulfilledBy", "name email bloodGroup")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Request.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/requests/:id — update request
export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await Request.findByIdAndUpdate(id, updates, { new: true })
            .populate("requester", "name email")
            .populate("fulfilledBy", "name email");

        if (!request) return res.status(404).json({ success: false, message: "Request not found." });

        await logAction(req.user._id, "REQUEST_UPDATED", "Request", request._id,
            `Updated request for ${request.bloodGroup} at ${request.hospital}`, { changes: Object.keys(updates) });

        res.json({ success: true, data: request, message: "Request updated." });
    } catch (error) {
        console.error("Update Request Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/requests/:id — delete request
export const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Request.findByIdAndDelete(id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found." });

        await logAction(req.user._id, "REQUEST_DELETED", "Request", request._id,
            `Deleted request for ${request.bloodGroup} at ${request.hospital}`);

        res.json({ success: true, message: "Request deleted." });
    } catch (error) {
        console.error("Delete Request Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/requests/:id/fulfill — force-fulfill
export const forceFulfillRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { donorId } = req.body;

        const request = await Request.findById(id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found." });

        request.status = "Completed";
        request.resolvedAt = new Date();
        if (donorId) request.fulfilledBy = donorId;
        await request.save();

        await logAction(req.user._id, "REQUEST_FORCE_FULFILLED", "Request", request._id,
            `Force-fulfilled request for ${request.bloodGroup} at ${request.hospital}`, { donorId });

        res.json({ success: true, data: request, message: "Request force-fulfilled." });
    } catch (error) {
        console.error("Force Fulfill Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  4. CAMP MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════

// GET /admin/camps — all camps with stats
export const getAdminCamps = async (req, res) => {
    try {
        const camps = await Camp.find()
            .populate("organizer", "name email")
            .sort({ date: -1 });

        res.json({ success: true, data: camps });
    } catch (error) {
        console.error("Get Camps Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /admin/camps — create camp
export const createCamp = async (req, res) => {
    try {
        const camp = await Camp.create({
            ...req.body,
            organizer: req.user._id,
        });

        await logAction(req.user._id, "CAMP_CREATED", "Camp", camp._id,
            `Created camp "${camp.name}" at ${camp.location}`);

        res.status(201).json({ success: true, data: camp, message: "Camp created." });
    } catch (error) {
        console.error("Create Camp Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /admin/camps/:id — edit camp
export const updateCamp = async (req, res) => {
    try {
        const camp = await Camp.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!camp) return res.status(404).json({ success: false, message: "Camp not found." });

        await logAction(req.user._id, "CAMP_UPDATED", "Camp", camp._id,
            `Updated camp "${camp.name}"`);

        res.json({ success: true, data: camp, message: "Camp updated." });
    } catch (error) {
        console.error("Update Camp Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /admin/camps/:id — delete camp
export const deleteCamp = async (req, res) => {
    try {
        const camp = await Camp.findByIdAndDelete(req.params.id);
        if (!camp) return res.status(404).json({ success: false, message: "Camp not found." });

        await logAction(req.user._id, "CAMP_DELETED", "Camp", camp._id,
            `Deleted camp "${camp.name}"`);

        res.json({ success: true, message: "Camp deleted." });
    } catch (error) {
        console.error("Delete Camp Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  5. SYSTEM HEALTH
// ═════════════════════════════════════════════════════════════════════════

export const getSystemHealth = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        const dbStatusMap = { 0: "Disconnected", 1: "Connected", 2: "Connecting", 3: "Disconnecting" };

        // Get collection counts
        const [userCount, requestCount, donationCount, paymentCount, campCount, auditCount] = await Promise.all([
            User.estimatedDocumentCount(),
            Request.estimatedDocumentCount(),
            Donation.estimatedDocumentCount(),
            Payment.estimatedDocumentCount(),
            Camp.estimatedDocumentCount(),
            AuditLog.estimatedDocumentCount(),
        ]);

        // Server info
        const uptime = process.uptime();
        const memUsage = process.memoryUsage();

        res.json({
            success: true,
            data: {
                server: {
                    nodeVersion: process.version,
                    platform: os.platform(),
                    arch: os.arch(),
                    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                    memory: {
                        rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)} MB`,
                        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
                        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
                    },
                    cpus: os.cpus().length,
                    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
                    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`,
                },
                database: {
                    status: dbStatusMap[dbStatus] || "Unknown",
                    connected: dbStatus === 1,
                    host: mongoose.connection.host || "N/A",
                    name: mongoose.connection.name || "N/A",
                    collections: {
                        users: userCount,
                        requests: requestCount,
                        donations: donationCount,
                        payments: paymentCount,
                        camps: campCount,
                        auditLogs: auditCount,
                    },
                    totalDocuments: userCount + requestCount + donationCount + paymentCount + campCount + auditCount,
                },
                environment: process.env.NODE_ENV || "development",
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("System Health Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  6. BROADCAST & ANNOUNCEMENTS
// ═════════════════════════════════════════════════════════════════════════

// POST /admin/broadcast — platform announcement (stored in audit for now)
export const sendBroadcast = async (req, res) => {
    try {
        const { title, message, type = "info", targetRole } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required." });
        }

        // Determine recipient count
        const filter = targetRole ? { role: targetRole } : {};
        const recipientCount = await User.countDocuments(filter);
        // Log action
        await logAction(req.user._id, "PLATFORM_BROADCAST", "Platform", null, `Broadcast sent: ${title}`, { level: type });

        // Save to DB and emit real-time event
        await triggerNotification({
            title,
            message,
            type: "broadcast"
        });

        res.json({ success: true, message: "Broadcast sent successfully to all connected clients." });
    } catch (error) {
        console.error("Broadcast Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  7. REVENUE & FINANCIAL
// ═════════════════════════════════════════════════════════════════════════

export const getRevenueDetails = async (req, res) => {
    try {
        const { period = "30" } = req.query;
        const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

        const [revenueTrend, topDonors, paymentStatus, recentPayments] = await Promise.all([
            // Daily revenue trend
            Payment.aggregate([
                { $match: { status: "success", createdAt: { $gte: daysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, date: "$_id", revenue: 1, count: 1 } },
            ]),

            // Top donors by amount
            Payment.aggregate([
                { $match: { status: "success" } },
                {
                    $group: {
                        _id: "$donorEmail",
                        totalAmount: { $sum: "$amount" },
                        name: { $first: "$donorName" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 10 },
                { $project: { _id: 0, email: "$_id", name: 1, totalAmount: 1, count: 1 } },
            ]),

            // Payment status distribution
            Payment.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
                { $project: { _id: 0, status: "$_id", count: 1, total: 1 } },
            ]),

            // Recent payments
            Payment.find().sort({ createdAt: -1 }).limit(15)
                .select("donorName donorEmail amount status receiptNumber createdAt"),
        ]);

        // Summary
        const totalRevenue = paymentStatus.find(s => s.status === "success")?.total || 0;
        const totalTransactions = paymentStatus.reduce((sum, s) => sum + s.count, 0);
        const successRate = totalTransactions > 0
            ? Math.round(((paymentStatus.find(s => s.status === "success")?.count || 0) / totalTransactions) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                summary: { totalRevenue, totalTransactions, successRate },
                revenueTrend,
                topDonors,
                paymentStatus,
                recentPayments,
            },
        });
    } catch (error) {
        console.error("Revenue Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════
//  8. AUDIT LOGS
// ═════════════════════════════════════════════════════════════════════════

export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 30, action, targetType, adminId } = req.query;
        const filter = {};

        if (action) filter.action = { $regex: action, $options: "i" };
        if (targetType) filter.targetType = targetType;
        if (adminId) filter.admin = adminId;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate("admin", "name email profilePicture")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            AuditLog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Audit Logs Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
