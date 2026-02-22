import Request from "../models/Request.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";

export const getAnalytics = async (req, res) => {
    try {
        const { timeframe = 'week' } = req.query;

        // Simple aggregate stats
        const totalDonors = await User.countDocuments({ role: "donor" });
        const totalRequests = await Request.countDocuments();
        const fulfilledRequests = await Request.countDocuments({ status: "Completed" });
        const urgentRequests = await Request.countDocuments({ urgency: { $in: ["Urgent", "Critical"] }, status: "Active" });

        // Calculate timeframe
        const now = new Date();
        let startDate = new Date();
        if (timeframe === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else {
            startDate.setDate(now.getDate() - 7);
        }

        // Aggregate Requests vs Donations Data
        const requestStats = await Request.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const donationStats = await Donation.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge stats for chart
        const dateMap = {};
        requestStats.forEach(item => {
            dateMap[item._id] = { name: item._id, requests: item.count, donations: 0 };
        });
        donationStats.forEach(item => {
            if (dateMap[item._id]) {
                dateMap[item._id].donations = item.count;
            } else {
                dateMap[item._id] = { name: item._id, requests: 0, donations: item.count };
            }
        });

        const recentActivityChart = Object.values(dateMap).sort((a, b) => a.name.localeCompare(b.name));

        // Fetch Recent Activity Logs
        const recentRequests = await Request.find().sort({ createdAt: -1 }).limit(10).populate('requester', 'name');
        const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(10).populate('donor', 'name');

        const combinedActivity = [
            ...recentRequests.map(r => ({
                id: r._id,
                type: 'request',
                message: `${r.requester?.name || 'Someone'} requested ${r.bloodGroup} at ${r.hospital}`,
                time: r.createdAt,
                urgency: r.urgency
            })),
            ...recentDonations.map(d => ({
                id: d._id,
                type: 'donation',
                message: `${d.donor?.name || 'A donor'} donated ${d.units} unit(s) at ${d.hospital}`,
                time: d.createdAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        // Blood group distribution
        const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        const distribution = await Promise.all(bloodGroups.map(async (bg) => {
            const count = await User.countDocuments({ bloodGroup: bg, role: "donor" });
            return { name: bg, value: count };
        }));

        res.json({
            success: true,
            data: {
                totalDonors,
                totalRequests,
                fulfilledRequests,
                urgentRequests,
                recentActivityChart,
                recentActivityLogs: combinedActivity,
                bloodGroupDistribution: distribution
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching analytics" });
    }
};
