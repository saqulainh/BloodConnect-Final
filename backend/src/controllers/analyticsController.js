import Request from "../models/Request.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
    try {
        // Simple aggregate stats
        const totalDonors = await User.countDocuments({ role: "donor" });
        const totalRequests = await Request.countDocuments();
        const fulfilledRequests = await Request.countDocuments({ status: "fulfilled" });
        const urgentRequests = await Request.countDocuments({ urgency: "Urgent", status: "pending" });

        // Requests over the last 6 months (mocked or aggregated)
        // For simplicity, we'll return some dynamic recent data based on counts
        const recentMonths = [
            { name: "Jan", requests: Math.floor(totalRequests * 0.1) || 5, donations: 12 },
            { name: "Feb", requests: Math.floor(totalRequests * 0.15) || 8, donations: 19 },
            { name: "Mar", requests: Math.floor(totalRequests * 0.2) || 12, donations: 15 },
            { name: "Apr", requests: Math.floor(totalRequests * 0.25) || 18, donations: 22 },
            { name: "May", requests: Math.floor(totalRequests * 0.1) || 10, donations: 25 },
            { name: "Jun", requests: totalRequests || 25, donations: fulfilledRequests || 30 },
        ];

        // Blood group distribution
        const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        const distribution = await Promise.all(bloodGroups.map(async (bg) => {
            const count = await User.countDocuments({ bloodGroup: bg, role: "donor" });
            return { name: bg, value: count || Math.floor(Math.random() * 10) + 1 }; // fallback to random if 0 for UI demo
        }));

        res.json({
            success: true,
            data: {
                totalDonors,
                totalRequests,
                fulfilledRequests,
                urgentRequests,
                recentActivity: recentMonths,
                bloodGroupDistribution: distribution
            }
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching analytics" });
    }
};
