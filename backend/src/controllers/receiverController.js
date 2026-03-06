import Request from "../models/Request.js";
import User from "../models/User.js";
import ReceiverWallet from "../models/ReceiverWallet.js";

// ─── Badge Tiers ────────────────────────────────────────────────────────────────
const RECEIVER_BADGES = [
    { min: 20, name: "Miracle Hero", emoji: "✨", next: null, nextMin: null },
    { min: 10, name: "Life Warrior", emoji: "⚔️", next: "Miracle Hero", nextMin: 20 },
    { min: 5, name: "Recovery Champion", emoji: "🏆", next: "Life Warrior", nextMin: 10 },
    { min: 2, name: "Survivor", emoji: "💪", next: "Recovery Champion", nextMin: 5 },
    { min: 0, name: "Newcomer", emoji: "🌱", next: "Survivor", nextMin: 2 },
];

const calculateReceiverBadge = (fulfilledCount) => {
    const tier = RECEIVER_BADGES.find(t => fulfilledCount >= t.min) || RECEIVER_BADGES[RECEIVER_BADGES.length - 1];
    const prevMin = tier.min;
    const nextMin = tier.nextMin;
    let progressPercentage = 100;
    let toNext = 0;
    if (nextMin !== null) {
        progressPercentage = Math.round(((fulfilledCount - prevMin) / (nextMin - prevMin)) * 100);
        toNext = nextMin - fulfilledCount;
    }
    return {
        badgeName: tier.name,
        badgeEmoji: tier.emoji,
        nextBadge: tier.next,
        nextBadgeMin: tier.nextMin,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        requestsToNext: Math.max(0, toNext),
    };
};

// ─── GET /api/v1/receiver/stats ─────────────────────────────────────────────────
// Returns receiver dashboard overview stats
export const getReceiverStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const allRequests = await Request.find({ requester: userId });
        const totalRequests = allRequests.length;
        const activeRequests = allRequests.filter(r => r.status === "Active" || r.status === "active").length;
        const fulfilledRequests = allRequests.filter(r => r.status === "Completed" || r.status === "resolved").length;
        const cancelledRequests = allRequests.filter(r => r.status === "Cancelled").length;
        const totalUnitsRequested = allRequests.reduce((sum, r) => sum + (r.units || 0), 0);
        const totalUnitsFulfilled = allRequests
            .filter(r => r.status === "Completed" || r.status === "resolved")
            .reduce((sum, r) => sum + (r.units || 0), 0);

        // Calculate avg fulfillment time (from creation to resolution)
        const fulfilledWithTimes = allRequests.filter(r =>
            (r.status === "Completed" || r.status === "resolved") && r.resolvedAt
        );
        let avgResponseHours = 0;
        if (fulfilledWithTimes.length > 0) {
            const totalHours = fulfilledWithTimes.reduce((sum, r) => {
                const diff = new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime();
                return sum + (diff / (1000 * 60 * 60));
            }, 0);
            avgResponseHours = Math.round(totalHours / fulfilledWithTimes.length);
        }

        // Fulfillment rate
        const fulfillmentRate = totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0;

        // Recent activity (last 10 requests)
        const recentActivity = allRequests
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(r => ({
                id: r._id,
                type: "request",
                message: `${r.bloodGroup} request at ${r.hospital} — ${r.status}`,
                urgency: r.urgency,
                time: r.createdAt,
                status: r.status
            }));

        res.json({
            success: true,
            data: {
                totalRequests,
                activeRequests,
                fulfilledRequests,
                cancelledRequests,
                totalUnitsRequested,
                totalUnitsFulfilled,
                avgResponseHours,
                fulfillmentRate,
                recentActivity,
            }
        });
    } catch (error) {
        console.error("Receiver Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/my-requests ───────────────────────────────────────────
// Returns all requests created by this receiver
export const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ requester: req.user._id })
            .populate("fulfilledBy", "name bloodGroup phone profilePicture")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: requests });
    } catch (error) {
        console.error("My Requests Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/wallet ────────────────────────────────────────────────
// Returns receiver wallet with badges, impact, and gratitude stats
export const getReceiverWalletStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get or create wallet
        let wallet = await ReceiverWallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await ReceiverWallet.create({ user: userId });
        }

        // Recalculate from actual request data
        const allRequests = await Request.find({ requester: userId });
        const fulfilledRequests = allRequests.filter(r => r.status === "Completed" || r.status === "resolved");
        const totalUnitsFulfilled = fulfilledRequests.reduce((sum, r) => sum + (r.units || 0), 0);

        // Update wallet
        wallet.totalRequestsMade = allRequests.length;
        wallet.totalRequestsFulfilled = fulfilledRequests.length;
        wallet.totalUnitsReceived = totalUnitsFulfilled;

        // Calculate badge
        const badge = calculateReceiverBadge(fulfilledRequests.length);
        wallet.badgeLevel = badge.badgeName;
        await wallet.save();

        // Lives impacted (each fulfilled request potentially saves the patient)
        const livesImpacted = fulfilledRequests.length;

        // Unique donors who helped
        const uniqueDonors = [...new Set(fulfilledRequests.filter(r => r.fulfilledBy).map(r => r.fulfilledBy.toString()))].length;

        res.json({
            success: true,
            data: {
                totalUnitsReceived: wallet.totalUnitsReceived,
                totalRequestsMade: wallet.totalRequestsMade,
                totalRequestsFulfilled: wallet.totalRequestsFulfilled,
                gratitudesSent: wallet.gratitudesSent,
                gratitudes: wallet.gratitudes || [],
                badge,
                livesImpacted,
                uniqueDonors,
            }
        });
    } catch (error) {
        console.error("Receiver Wallet Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/analytics ─────────────────────────────────────────────
// Returns personal analytics for the receiver
export const getReceiverAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const allRequests = await Request.find({ requester: userId }).sort({ createdAt: 1 });

        // Monthly trend chart data
        const monthlyMap = {};
        allRequests.forEach(r => {
            const key = new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            if (!monthlyMap[key]) monthlyMap[key] = { requests: 0, fulfilled: 0 };
            monthlyMap[key].requests++;
            if (r.status === "Completed" || r.status === "resolved") monthlyMap[key].fulfilled++;
        });
        const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({
            month,
            requests: data.requests,
            fulfilled: data.fulfilled,
        }));

        // Blood group demand distribution
        const bgMap = {};
        allRequests.forEach(r => {
            bgMap[r.bloodGroup] = (bgMap[r.bloodGroup] || 0) + 1;
        });
        const bloodGroupDemand = Object.entries(bgMap).map(([name, value]) => ({ name, value }));

        // Urgency distribution
        const urgencyMap = {};
        allRequests.forEach(r => {
            urgencyMap[r.urgency] = (urgencyMap[r.urgency] || 0) + 1;
        });
        const urgencyDistribution = Object.entries(urgencyMap).map(([name, value]) => ({ name, value }));

        // Fulfillment rate
        const total = allRequests.length;
        const fulfilled = allRequests.filter(r => r.status === "Completed" || r.status === "resolved").length;
        const fulfillmentRate = total > 0 ? Math.round((fulfilled / total) * 100) : 0;

        // Avg response time
        const withTimes = allRequests.filter(r =>
            (r.status === "Completed" || r.status === "resolved") && r.resolvedAt
        );
        let avgResponseHours = 0;
        if (withTimes.length > 0) {
            const totalH = withTimes.reduce((sum, r) => {
                return sum + ((new Date(r.resolvedAt) - new Date(r.createdAt)) / (1000 * 60 * 60));
            }, 0);
            avgResponseHours = Math.round(totalH / withTimes.length);
        }

        // Unique donors
        const uniqueDonors = [...new Set(allRequests.filter(r => r.fulfilledBy).map(r => r.fulfilledBy.toString()))].length;

        res.json({
            success: true,
            data: {
                monthlyTrend,
                bloodGroupDemand,
                urgencyDistribution,
                fulfillmentRate,
                avgResponseHours,
                uniqueDonors,
                totalRequests: total,
                totalFulfilled: fulfilled,
            }
        });
    } catch (error) {
        console.error("Receiver Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/v1/receiver/gratitude ────────────────────────────────────────────
// Send a gratitude/thank-you message to a donor
export const sendGratitude = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId, donorId, message } = req.body;

        if (!requestId || !donorId) {
            return res.status(400).json({ success: false, message: "requestId and donorId are required." });
        }

        // Verify the request belongs to this receiver
        const request = await Request.findOne({ _id: requestId, requester: userId });
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or not yours." });
        }

        // Get or create wallet
        let wallet = await ReceiverWallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await ReceiverWallet.create({ user: userId });
        }

        // Check if already sent gratitude for this request
        const alreadySent = wallet.gratitudes.some(
            g => g.request?.toString() === requestId && g.donor?.toString() === donorId
        );
        if (alreadySent) {
            return res.status(400).json({ success: false, message: "Gratitude already sent for this donation." });
        }

        wallet.gratitudes.push({
            request: requestId,
            donor: donorId,
            message: message || "Thank you for saving a life! 🙏",
            sentAt: new Date(),
        });
        wallet.gratitudesSent = (wallet.gratitudesSent || 0) + 1;
        await wallet.save();

        res.json({ success: true, message: "Gratitude sent successfully! 💚" });
    } catch (error) {
        console.error("Send Gratitude Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/timeline/:requestId ───────────────────────────────────
// Returns the full timeline/journey of a specific request
export const getRequestTimeline = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await Request.findOne({ _id: requestId, requester: userId })
            .populate("requester", "name bloodGroup")
            .populate("fulfilledBy", "name bloodGroup profilePicture");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        // Build journey stages based on request state
        const stages = [];
        const createdAt = request.createdAt;

        stages.push({
            stage: "Request Created",
            icon: "📋",
            timestamp: createdAt,
            message: `Blood request for ${request.bloodGroup} (${request.units} units) created at ${request.hospital}.`,
            completed: true,
        });

        stages.push({
            stage: "Searching Donors",
            icon: "🔍",
            timestamp: new Date(new Date(createdAt).getTime() + 60000),
            message: `Searching for compatible ${request.bloodGroup} donors nearby...`,
            completed: true,
        });

        const isFulfilled = request.status === "Completed" || request.status === "resolved";

        stages.push({
            stage: "Donor Matched",
            icon: "🤝",
            timestamp: isFulfilled && request.resolvedAt
                ? new Date(new Date(createdAt).getTime() + (new Date(request.resolvedAt) - new Date(createdAt)) * 0.3)
                : null,
            message: isFulfilled && request.fulfilledBy
                ? `Donor ${request.fulfilledBy.name || "Anonymous"} (${request.fulfilledBy.bloodGroup}) matched!`
                : "Waiting for a donor match...",
            completed: isFulfilled,
        });

        stages.push({
            stage: "Blood Donated",
            icon: "🩸",
            timestamp: isFulfilled && request.resolvedAt
                ? new Date(new Date(createdAt).getTime() + (new Date(request.resolvedAt) - new Date(createdAt)) * 0.6)
                : null,
            message: isFulfilled ? "Blood donation completed at hospital." : "Pending donation...",
            completed: isFulfilled,
        });

        stages.push({
            stage: "Testing & Processing",
            icon: "🧪",
            timestamp: isFulfilled && request.resolvedAt
                ? new Date(new Date(createdAt).getTime() + (new Date(request.resolvedAt) - new Date(createdAt)) * 0.8)
                : null,
            message: isFulfilled ? "Blood tested and cleared for transfusion." : "Awaiting lab clearance...",
            completed: isFulfilled,
        });

        stages.push({
            stage: "Delivered",
            icon: "✅",
            timestamp: isFulfilled ? request.resolvedAt : null,
            message: isFulfilled ? `Blood delivered to ${request.patientName}. Life saved! 💚` : "Waiting for delivery...",
            completed: isFulfilled,
        });

        res.json({
            success: true,
            data: {
                request: {
                    _id: request._id,
                    bloodGroup: request.bloodGroup,
                    hospital: request.hospital,
                    patientName: request.patientName,
                    units: request.units,
                    urgency: request.urgency,
                    status: request.status,
                    createdAt: request.createdAt,
                    resolvedAt: request.resolvedAt,
                    fulfilledBy: request.fulfilledBy,
                },
                stages,
            }
        });
    } catch (error) {
        console.error("Request Timeline Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
