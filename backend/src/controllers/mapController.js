import User from "../models/User.js";
import Request from "../models/Request.js";
import { fuzzLocation } from "../services/geoService.js";

// @desc    Get donors within radius of a point
// @route   GET /api/v1/map/nearby-donors
// @access  Private
export const getNearbyDonors = async (req, res) => {
    try {
        const { lat, lng, radiusKm = 10 } = req.query;

        // Radius of Earth in kilometers
        const earthRadiusKm = 6378.1;
        const radiusInRadians = parseFloat(radiusKm) / earthRadiusKm;

        // Ensure indices are built (already handled in model init technically)
        // Find users with location inside radius
        const donors = await User.find({
            eligibilityStatus: { $in: ["eligible", "cooling"] },
            location: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians]
                }
            }
        }).select("-password -aadhaarNumber -otp -otpExpires"); // Exclude sensitive details

        // Fuzz locations before sending to frontend for privacy
        const fuzzedDonors = donors.map(donor => {
            const doc = donor.toObject();
            if (doc.location && doc.location.coordinates) {
                doc.location.coordinates = fuzzLocation(doc.location.coordinates);
            }
            return doc;
        });

        res.json({ success: true, count: fuzzedDonors.length, data: fuzzedDonors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active requests with urgency scores
// @route   GET /api/v1/map/active-requests
// @access  Private
export const getActiveMapRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: "Active" })
            .select("patientName bloodGroup hospital location urgencyLevel urgencyScore units status createdAt")
            .populate("requester", "name phone")
            .sort({ urgencyScore: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
