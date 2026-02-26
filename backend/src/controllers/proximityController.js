import User from "../models/User.js";

/**
 * GET /api/v1/proximity/donors
 * Smart donor matching: sorted by geo-distance with estimated drive time
 * Query params: lat, lng, bloodGroup (optional), radius (km, default 20)
 */
export const getNearbyDonors = async (req, res) => {
    try {
        const { lat, lng, bloodGroup, radius = 20 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "lat and lng are required" });
        }

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        const radiusMeters = parseFloat(radius) * 1000;

        const matchStage = {
            role: "donor",
            availability: true,
            "location.coordinates": { $exists: true, $ne: [] },
        };

        if (bloodGroup && bloodGroup !== "All") {
            matchStage.bloodGroup = bloodGroup;
        }

        // MongoDB $geoNear aggregation — returns donors sorted by distance
        const donors = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [lngNum, latNum] },
                    distanceField: "distanceMeters",
                    maxDistance: radiusMeters,
                    spherical: true,
                    query: matchStage,
                },
            },
            {
                $project: {
                    name: 1,
                    bloodGroup: 1,
                    phone: 1,
                    address: 1,
                    profilePicture: 1,
                    aadhaarVerified: 1,
                    availability: 1,
                    lastDonation: 1,
                    distanceMeters: 1,
                    location: 1,
                },
            },
            { $limit: 30 },
        ]);

        // Calculate drive time estimate (avg 30 km/h in city traffic)
        const AVG_SPEED_KMH = 30;
        const enriched = donors.map((donor) => {
            const distKm = donor.distanceMeters / 1000;
            const driveMinutes = Math.round((distKm / AVG_SPEED_KMH) * 60);

            // Eligibility check: 56-day gap between donations
            let isEligible = true;
            let eligibilityNote = "Ready to donate";
            if (donor.lastDonation) {
                const daysSinceLast = Math.floor(
                    (Date.now() - new Date(donor.lastDonation).getTime()) / (1000 * 60 * 60 * 24)
                );
                if (daysSinceLast < 56) {
                    isEligible = false;
                    eligibilityNote = `Eligible in ${56 - daysSinceLast} day(s)`;
                }
            }

            return {
                ...donor,
                distanceKm: parseFloat(distKm.toFixed(1)),
                driveTimeMinutes: driveMinutes,
                driveTimeLabel:
                    driveMinutes < 2 ? "< 2 min" :
                        driveMinutes < 60 ? `~${driveMinutes} min` :
                            `~${Math.round(driveMinutes / 60)}h ${driveMinutes % 60}m`,
                isEligible,
                eligibilityNote,
            };
        });

        res.json({
            success: true,
            data: enriched,
            meta: { total: enriched.length, radiusKm: parseFloat(radius), center: { lat: latNum, lng: lngNum } },
        });
    } catch (error) {
        console.error("Proximity Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
