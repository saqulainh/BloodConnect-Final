import Request from "../models/Request.js";
import User from "../models/User.js";
import ReceiverWallet from "../models/ReceiverWallet.js";

// ─── Badge Tiers ─────────────────────────────────────────────────────────────
const RECEIVER_BADGES = [
    { min: 20, name: "Miracle Hero",       emoji: "✨", next: null,              nextMin: null },
    { min: 10, name: "Life Warrior",       emoji: "⚔️", next: "Miracle Hero",   nextMin: 20   },
    { min: 5,  name: "Recovery Champion",  emoji: "🏆", next: "Life Warrior",   nextMin: 10   },
    { min: 2,  name: "Survivor",           emoji: "💪", next: "Recovery Champ", nextMin: 5    },
    { min: 0,  name: "Newcomer",           emoji: "🌱", next: "Survivor",       nextMin: 2    },
];

const calculateReceiverBadge = (fulfilledCount) => {
    const tier = RECEIVER_BADGES.find(t => fulfilledCount >= t.min) || RECEIVER_BADGES[RECEIVER_BADGES.length - 1];
    const nextMin = tier.nextMin;
    const progressPercentage = nextMin !== null
        ? Math.min(100, Math.round(((fulfilledCount - tier.min) / (nextMin - tier.min)) * 100))
        : 100;
    return {
        badgeName: tier.name,
        badgeEmoji: tier.emoji,
        nextBadge: tier.next,
        nextBadgeMin: tier.nextMin,
        progressPercentage: Math.max(0, progressPercentage),
        requestsToNext: Math.max(0, nextMin !== null ? nextMin - fulfilledCount : 0),
    };
};

// ─── Helper: categorise requests ─────────────────────────────────────────────
const isFulfilled  = r => r.status === "Completed" || r.status === "resolved";
const isCancelled  = r => r.status === "Cancelled";
const isActive     = r => r.status === "Active"    || r.status === "active";

// ─── GET /api/v1/receiver/stats ──────────────────────────────────────────────
export const getReceiverStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const allRequests = await Request.find({ requester: userId }).sort({ createdAt: -1 });

        const totalRequests     = allRequests.length;
        const activeRequests    = allRequests.filter(isActive).length;
        const fulfilledRequests = allRequests.filter(isFulfilled).length;
        const cancelledRequests = allRequests.filter(isCancelled).length;
        const pendingRequests   = activeRequests; // alias

        const totalUnitsRequested = allRequests.reduce((s, r) => s + (r.units || 0), 0);
        const totalUnitsFulfilled = allRequests.filter(isFulfilled).reduce((s, r) => s + (r.units || 0), 0);

        // Avg fulfillment time
        const resolvedWithTimes = allRequests.filter(r => isFulfilled(r) && r.resolvedAt);
        const avgResponseHours = resolvedWithTimes.length
            ? Math.round(resolvedWithTimes.reduce((s, r) =>
                s + ((new Date(r.resolvedAt) - new Date(r.createdAt)) / 3_600_000), 0
              ) / resolvedWithTimes.length)
            : 0;

        const fulfillmentRate = totalRequests > 0
            ? Math.round((fulfilledRequests / totalRequests) * 100) : 0;
        const cancellationRate = totalRequests > 0
            ? Math.round((cancelledRequests / totalRequests) * 100) : 0;

        // Blood group breakdown
        const bgBreakdown = {};
        allRequests.forEach(r => {
            bgBreakdown[r.bloodGroup] = (bgBreakdown[r.bloodGroup] || 0) + 1;
        });

        // Recent activity (last 10)
        const recentActivity = allRequests.slice(0, 10).map(r => ({
            id: r._id,
            type: "request",
            message: `${r.bloodGroup} request at ${r.hospital} — ${r.status}`,
            urgency: r.urgency,
            time: r.createdAt,
            status: r.status,
        }));

        // Urgency breakdown
        const urgencyBreakdown = { Normal: 0, Urgent: 0, Critical: 0 };
        allRequests.forEach(r => { urgencyBreakdown[r.urgency] = (urgencyBreakdown[r.urgency] || 0) + 1; });

        res.json({
            success: true,
            data: {
                totalRequests, activeRequests, fulfilledRequests, cancelledRequests, pendingRequests,
                totalUnitsRequested, totalUnitsFulfilled, avgResponseHours,
                fulfillmentRate, cancellationRate, bgBreakdown, urgencyBreakdown,
                recentActivity,
            }
        });
    } catch (error) {
        console.error("Receiver Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/my-requests ────────────────────────────────────────
export const getMyRequests = async (req, res) => {
    try {
        const { status, urgency, bloodGroup, sort = "newest" } = req.query;

        const filter = { requester: req.user._id };
        if (status && status !== "All") {
            if (status === "Fulfilled") filter.status = { $in: ["Completed", "resolved"] };
            else filter.status = status;
        }
        if (urgency)    filter.urgency    = urgency;
        if (bloodGroup) filter.bloodGroup = bloodGroup;

        const sortMap = {
            newest:  { createdAt: -1 },
            oldest:  { createdAt:  1 },
            urgency: { urgencyScore: -1, createdAt: -1 },
        };

        const requests = await Request.find(filter)
            .populate("fulfilledBy", "name bloodGroup phone profilePicture email")
            .sort(sortMap[sort] || { createdAt: -1 });

        res.json({ success: true, data: requests, total: requests.length });
    } catch (error) {
        console.error("My Requests Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PATCH /api/v1/receiver/requests/:id/cancel ──────────────────────────────
export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        const request = await Request.findOne({ _id: id, requester: userId });
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or not yours." });
        }
        if (!isActive(request)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a request with status: ${request.status}.`
            });
        }

        request.status         = "Cancelled";
        request.cancelledAt    = new Date();
        request.cancelledReason = reason || "Cancelled by receiver";
        await request.save();

        res.json({
            success: true,
            message: "Request cancelled successfully.",
            data: { _id: request._id, status: request.status, cancelledReason: request.cancelledReason }
        });
    } catch (error) {
        console.error("Cancel Request Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/nearby-urgent ──────────────────────────────────────
export const getNearbyUrgentRequests = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "lat and lng are required." });
        }

        const radiusKm       = Math.min(200, parseFloat(radius));
        const radiusRadians  = radiusKm / 6378.1;

        const requests = await Request.find({
            status: "Active",
            urgency: { $in: ["Urgent", "Critical"] },
            location: {
                $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRadians] }
            }
        })
        .sort({ urgencyScore: -1, createdAt: -1 })
        .limit(10)
        .select("bloodGroup hospital urgency units createdAt patientName urgencyScore");

        res.json({ success: true, data: requests, total: requests.length });
    } catch (error) {
        console.error("Nearby Urgent Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/wallet ─────────────────────────────────────────────
export const getReceiverWalletStats = async (req, res) => {
    try {
        const userId = req.user._id;

        let wallet = await ReceiverWallet.findOne({ user: userId });
        if (!wallet) wallet = await ReceiverWallet.create({ user: userId });

        const allRequests       = await Request.find({ requester: userId });
        const fulfilledRequests = allRequests.filter(isFulfilled);
        const totalUnitsFulfilled = fulfilledRequests.reduce((s, r) => s + (r.units || 0), 0);

        // Update wallet from live data
        wallet.totalRequestsMade      = allRequests.length;
        wallet.totalRequestsFulfilled = fulfilledRequests.length;
        wallet.totalUnitsReceived     = totalUnitsFulfilled;

        const badge = calculateReceiverBadge(fulfilledRequests.length);
        wallet.badgeLevel = badge.badgeName;
        await wallet.save();

        // Unique donors
        const uniqueDonors = [...new Set(
            fulfilledRequests.filter(r => r.fulfilledBy).map(r => r.fulfilledBy.toString())
        )].length;

        // Lives impacted = fulfilled requests (a completed request = patient received blood)
        const livesImpacted = fulfilledRequests.length;

        // Avg fulfillment time
        const resolvedWithTimes = fulfilledRequests.filter(r => r.resolvedAt);
        const avgFulfillmentHours = resolvedWithTimes.length
            ? Math.round(resolvedWithTimes.reduce((s, r) =>
                s + ((new Date(r.resolvedAt) - new Date(r.createdAt)) / 3_600_000), 0
              ) / resolvedWithTimes.length)
            : 0;

        // Recent fulfilled history (for wallet timeline)
        const recentFulfilled = fulfilledRequests
            .sort((a, b) => new Date(b.resolvedAt || b.createdAt) - new Date(a.resolvedAt || a.createdAt))
            .slice(0, 5)
            .map(r => ({
                _id: r._id,
                bloodGroup: r.bloodGroup,
                hospital: r.hospital,
                units: r.units,
                resolvedAt: r.resolvedAt || r.updatedAt,
            }));

        res.json({
            success: true,
            data: {
                totalUnitsReceived:     wallet.totalUnitsReceived,
                totalRequestsMade:      wallet.totalRequestsMade,
                totalRequestsFulfilled: wallet.totalRequestsFulfilled,
                gratitudesSent:         wallet.gratitudesSent,
                gratitudes:             wallet.gratitudes || [],
                badge,
                livesImpacted,
                uniqueDonors,
                avgFulfillmentHours,
                recentFulfilled,
            }
        });
    } catch (error) {
        console.error("Receiver Wallet Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/analytics ──────────────────────────────────────────
export const getReceiverAnalytics = async (req, res) => {
    try {
        const userId      = req.user._id;
        const allRequests = await Request.find({ requester: userId }).sort({ createdAt: 1 });

        // Monthly trend
        const monthlyMap = {};
        allRequests.forEach(r => {
            const key = new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            if (!monthlyMap[key]) monthlyMap[key] = { requests: 0, fulfilled: 0, cancelled: 0 };
            monthlyMap[key].requests++;
            if (isFulfilled(r))  monthlyMap[key].fulfilled++;
            if (isCancelled(r))  monthlyMap[key].cancelled++;
        });
        const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

        // Weekly heatmap (last 12 weeks — requests by week)
        const now = new Date();
        const weeklyData = Array.from({ length: 12 }, (_, i) => {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (11 - i) * 7);
            const weekEnd   = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            const label     = `W${12 - i}`;
            const count     = allRequests.filter(r => {
                const d = new Date(r.createdAt);
                return d >= weekStart && d < weekEnd;
            }).length;
            return { week: label, requests: count };
        });

        // Blood group demand
        const bgMap = {};
        allRequests.forEach(r => { bgMap[r.bloodGroup] = (bgMap[r.bloodGroup] || 0) + 1; });
        const bloodGroupDemand = Object.entries(bgMap).map(([name, value]) => ({ name, value }));

        // Urgency distribution
        const urgencyMap = {};
        allRequests.forEach(r => { urgencyMap[r.urgency] = (urgencyMap[r.urgency] || 0) + 1; });
        const urgencyDistribution = Object.entries(urgencyMap).map(([name, value]) => ({ name, value }));

        // Response time distribution (hours buckets)
        const resolved = allRequests.filter(r => isFulfilled(r) && r.resolvedAt);
        const rtBuckets = { "<1h": 0, "1-6h": 0, "6-24h": 0, "1-3d": 0, ">3d": 0 };
        resolved.forEach(r => {
            const h = (new Date(r.resolvedAt) - new Date(r.createdAt)) / 3_600_000;
            if      (h < 1)   rtBuckets["<1h"]++;
            else if (h < 6)   rtBuckets["1-6h"]++;
            else if (h < 24)  rtBuckets["6-24h"]++;
            else if (h < 72)  rtBuckets["1-3d"]++;
            else               rtBuckets[">3d"]++;
        });
        const responseTimeDistribution = Object.entries(rtBuckets).map(([name, value]) => ({ name, value }));

        const total        = allRequests.length;
        const fulfilled    = allRequests.filter(isFulfilled).length;
        const cancelled    = allRequests.filter(isCancelled).length;
        const fulfillmentRate  = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
        const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

        const avgResponseHours = resolved.length
            ? Math.round(resolved.reduce((s, r) =>
                s + ((new Date(r.resolvedAt) - new Date(r.createdAt)) / 3_600_000), 0
              ) / resolved.length)
            : 0;

        const uniqueDonors = [...new Set(
            allRequests.filter(r => r.fulfilledBy).map(r => r.fulfilledBy.toString())
        )].length;

        res.json({
            success: true,
            data: {
                monthlyTrend, weeklyData, bloodGroupDemand, urgencyDistribution, responseTimeDistribution,
                fulfillmentRate, cancellationRate, avgResponseHours, uniqueDonors,
                totalRequests: total, totalFulfilled: fulfilled, totalCancelled: cancelled,
            }
        });
    } catch (error) {
        console.error("Receiver Analytics Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/v1/receiver/gratitude ─────────────────────────────────────────
export const sendGratitude = async (req, res) => {
    try {
        const userId = req.user._id;
        const { requestId, donorId, message, rating } = req.body;

        if (!requestId || !donorId) {
            return res.status(400).json({ success: false, message: "requestId and donorId are required." });
        }

        // Verify ownership
        const request = await Request.findOne({ _id: requestId, requester: userId });
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or not yours." });
        }

        let wallet = await ReceiverWallet.findOne({ user: userId });
        if (!wallet) wallet = await ReceiverWallet.create({ user: userId });

        // Idempotency check
        const alreadySent = wallet.gratitudes.some(
            g => g.request?.toString() === requestId && g.donor?.toString() === donorId
        );
        if (alreadySent) {
            return res.status(400).json({ success: false, message: "Gratitude already sent for this donation." });
        }

        wallet.gratitudes.push({
            request: requestId,
            donor:   donorId,
            message: message || "Thank you for saving a life! 🙏",
            sentAt:  new Date(),
        });
        wallet.gratitudesSent = (wallet.gratitudesSent || 0) + 1;
        await wallet.save();

        res.json({ success: true, message: "Gratitude sent! 💚" });
    } catch (error) {
        console.error("Send Gratitude Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/v1/receiver/timeline/:requestId ─────────────────────────────────
export const getRequestTimeline = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId        = req.user._id;

        const request = await Request.findOne({ _id: requestId, requester: userId })
            .populate("requester",  "name bloodGroup")
            .populate("fulfilledBy","name bloodGroup profilePicture phone");

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        const createdAt  = request.createdAt;
        const fulfilled  = isFulfilled(request);
        const cancelled  = isCancelled(request);
        const resolvedAt = request.resolvedAt;

        const stages = [
            {
                stage:     "Request Created",
                icon:      "📋",
                timestamp: createdAt,
                message:   `Blood request for ${request.bloodGroup} (${request.units} unit${request.units > 1 ? "s" : ""}) created at ${request.hospital}.`,
                completed: true,
            },
            {
                stage:     "Searching Donors",
                icon:      "🔍",
                timestamp: new Date(+createdAt + 60_000),
                message:   `Scanning nearby ${request.bloodGroup} donors...`,
                completed: !cancelled,
            },
            {
                stage:     "Donor Matched",
                icon:      "🤝",
                timestamp: fulfilled && resolvedAt
                    ? new Date(+createdAt + (+resolvedAt - +createdAt) * 0.3)
                    : null,
                message: fulfilled && request.fulfilledBy
                    ? `Donor ${request.fulfilledBy.name || "Anonymous"} (${request.fulfilledBy.bloodGroup}) matched!`
                    : cancelled ? "Search cancelled." : "Waiting for a donor match...",
                completed: fulfilled,
            },
            {
                stage:     "Blood Donated",
                icon:      "🩸",
                timestamp: fulfilled && resolvedAt
                    ? new Date(+createdAt + (+resolvedAt - +createdAt) * 0.55)
                    : null,
                message:   fulfilled ? "Blood donation completed at hospital." : cancelled ? "—" : "Pending donation...",
                completed: fulfilled,
            },
            {
                stage:     "Testing & Processing",
                icon:      "🧪",
                timestamp: fulfilled && resolvedAt
                    ? new Date(+createdAt + (+resolvedAt - +createdAt) * 0.80)
                    : null,
                message:   fulfilled ? "Blood tested and cleared for transfusion." : cancelled ? "—" : "Awaiting lab clearance...",
                completed: fulfilled,
            },
            {
                stage:     "Delivered",
                icon:      "✅",
                timestamp: fulfilled ? resolvedAt : null,
                message:   fulfilled
                    ? `Blood delivered to ${request.patientName}. Life saved! 💚`
                    : cancelled
                        ? `Request cancelled: ${request.cancelledReason || "No reason provided."}`
                        : "Waiting for delivery...",
                completed: fulfilled,
                final:     true,
            },
        ];

        // If cancelled, mark search as completed and everything after as failed
        if (cancelled) {
            stages[1].completed = true;
            stages[1].timestamp = request.cancelledAt || new Date(+createdAt + 60_000);
        }

        res.json({
            success: true,
            data: {
                request: {
                    _id:            request._id,
                    bloodGroup:     request.bloodGroup,
                    hospital:       request.hospital,
                    patientName:    request.patientName,
                    units:          request.units,
                    urgency:        request.urgency,
                    status:         request.status,
                    createdAt:      request.createdAt,
                    resolvedAt:     request.resolvedAt,
                    cancelledAt:    request.cancelledAt,
                    cancelledReason: request.cancelledReason,
                    fulfilledBy:    request.fulfilledBy,
                    description:    request.description,
                    contactPhone:   request.contactPhone,
                },
                stages,
            }
        });
    } catch (error) {
        console.error("Request Timeline Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
