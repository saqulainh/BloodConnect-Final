import User from "../models/User.js";
import Request from "../models/Request.js";
import getPusher from "../utils/pusher.js";

/**
 * POST /api/v1/sos/broadcast
 * Broadcasts a critical blood request to all nearby available donors
 * Body: { bloodGroup, hospital, lat, lng, message }
 */
export const broadcastSOS = async (req, res) => {
    try {
        const { bloodGroup, hospital, lat, lng, message, patientName } = req.body;

        if (!bloodGroup || !hospital) {
            return res.status(400).json({ success: false, message: "bloodGroup and hospital are required" });
        }

        // Build donor query
        const query = {
            role: "donor",
            availability: true,
            bloodGroup,
        };

        // If location provided, find nearby donors (50km radius)
        let donors;
        if (lat && lng) {
            donors = await User.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                        distanceField: "distanceMeters",
                        maxDistance: 50000, // 50km
                        spherical: true,
                        query,
                    },
                },
                { $project: { name: 1, phone: 1, email: 1, bloodGroup: 1, distanceMeters: 1 } },
                { $limit: 50 },
            ]);
        } else {
            donors = await User.find(query).select("name phone email bloodGroup").limit(50);
        }

        const alertPayload = {
            id: `sos_${Date.now()}`,
            bloodGroup,
            hospital,
            patientName: patientName || "Emergency Patient",
            message: message || `URGENT: ${bloodGroup} blood needed at ${hospital}`,
            requestedBy: req.user?.name || "BloodConnect Admin",
            requesterId: req.user?._id,
            timestamp: new Date().toISOString(),
            donorCount: donors.length,
        };

        // Push real-time alert via Pusher to the SOS channel
        try {
            const pusher = getPusher();
            await pusher.trigger("sos-alerts", "new-sos", alertPayload);
        } catch (pusherErr) {
            console.warn("Pusher trigger failed (non-fatal):", pusherErr.message);
        }

        res.json({
            success: true,
            message: `SOS broadcast sent to ${donors.length} eligible donor(s)`,
            data: {
                ...alertPayload,
                nearbyDonors: donors.map(d => ({
                    name: d.name,
                    bloodGroup: d.bloodGroup,
                    distanceKm: d.distanceMeters ? parseFloat((d.distanceMeters / 1000).toFixed(1)) : null,
                })),
            },
        });
    } catch (error) {
        console.error("SOS Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/sos/active
 * Returns active critical blood requests (for donor alert feed)
 */
export const getActiveSOSAlerts = async (req, res) => {
    try {
        // "Critical" urgency requests in last 12 hours
        const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const alerts = await Request.find({
            urgency: { $in: ["Critical", "Urgent"] },
            status: "Active",
            createdAt: { $gte: since },
        })
            .populate("requester", "name phone")
            .sort({ urgency: -1, createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: alerts.map(a => ({
                id: a._id,
                bloodGroup: a.bloodGroup,
                hospital: a.hospital,
                urgency: a.urgency,
                units: a.units,
                patientName: a.patientName,
                requester: a.requester?.name,
                requesterPhone: a.requester?.phone,
                createdAt: a.createdAt,
                location: a.location,
            })),
        });
    } catch (error) {
        console.error("SOS Alerts Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
