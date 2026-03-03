import User from "../models/User.js";
import Request from "../models/Request.js";
import Donation from "../models/Donation.js";
import Payment from "../models/Payment.js";

// GET /api/v1/admin/mission-stats (admin only)
export const getMissionStats = async (req, res) => {
    try {
        // Verify admin role
        if (req.user?.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // ── Summary Stats ─────────────────────────────────────────────
        const [
            totalUsers,
            totalDonors,
            totalRequests,
            fulfilledRequests,
            totalRevenue,
            newUsersThisWeek,
            successfulDonations,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "donor" }),
            Request.countDocuments(),
            Request.countDocuments({ status: "Completed" }),
            Payment.aggregate([
                { $match: { status: "success" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]),
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
            Payment.countDocuments({ status: "success" }),
        ]);

        const totalRevenueAmount = totalRevenue[0]?.total || 0;

        // ── Donor Growth (Last 30 Days) ───────────────────────────────
        const donorGrowth = await User.aggregate([
            { $match: { role: "donor", createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    donors: "$count",
                }
            }
        ]);

        // ── Revenue Trend (Last 30 Days) ──────────────────────────────
        const revenueTrend = await Payment.aggregate([
            { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: 1,
                    donations: "$count",
                }
            }
        ]);

        // ── Top Blood Groups Requested ────────────────────────────────
        const bloodGroupStats = await Request.aggregate([
            { $group: { _id: "$bloodGroup", requests: { $sum: 1 } } },
            { $sort: { requests: -1 } },
            { $project: { _id: 0, bloodGroup: "$_id", requests: 1 } },
        ]);

        // ── Top 5 Donor Cities ────────────────────────────────────────
        const topCities = await User.aggregate([
            { $match: { role: "donor", city: { $exists: true, $ne: "" } } },
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, city: "$_id", donors: "$count" } },
        ]);

        // ── Recent Transactions ───────────────────────────────────────
        const recentTransactions = await Payment.find({ status: "success" })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("donorName donorEmail amount receiptNumber createdAt");

        res.json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    totalDonors,
                    totalRequests,
                    fulfilledRequests,
                    totalRevenue: totalRevenueAmount,
                    successfulDonations,
                    newUsersThisWeek,
                    fulfillmentRate: totalRequests > 0
                        ? Math.round((fulfilledRequests / totalRequests) * 100)
                        : 0,
                },
                donorGrowth,
                revenueTrend,
                bloodGroupStats,
                topCities,
                recentTransactions,
            },
        });
    } catch (error) {
        console.error("Admin Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
