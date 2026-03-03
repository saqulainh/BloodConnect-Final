import Donation from "../models/Donation.js";
import User from "../models/User.js";
import {
    calculateBadge,
    calculateImpact,
    calculateEligibility,
    calculateStreak,
    calculateFitnessScore,
} from "../utils/healthUtils.js";

// ─── GET /api/v1/health-wallet/stats ─────────────────────────────────────────
// Returns all donor stats, badge, impact, eligibility, streak, and chart data
export const getHealthWalletStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all blood donations sorted by date ascending (for streak calc)
        const donations = await Donation.find({ donor: userId }).sort({ date: 1 });

        const totalDonations = donations.length;
        const totalUnits = donations.reduce((sum, d) => sum + (d.units || 0), 0);

        // Badge engine
        const badge = calculateBadge(totalDonations);

        // Impact engine
        const { livesSaved, impactScore } = calculateImpact(totalDonations, totalUnits);

        // Eligibility (use lastDonation from User profile or most recent donation)
        const user = await User.findById(userId).select("lastDonation");
        const lastDonationDate = user?.lastDonation || (donations.length > 0 ? donations[donations.length - 1].date : null);
        const eligibility = calculateEligibility(lastDonationDate);

        // Streak
        const donationDates = donations.map(d => d.date);
        const { streak, longestStreak } = calculateStreak(donationDates);

        // Chart data: group by month for contribution growth chart
        const chartMap = {};
        donations.forEach(d => {
            const key = new Date(d.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            chartMap[key] = (chartMap[key] || 0) + (d.units || 0);
        });
        const chartData = Object.entries(chartMap).map(([date, units]) => ({ date, units }));

        // Timeline: sorted descending (most recent first)
        const timeline = [...donations].reverse().map(d => {
            const daysSince = Math.floor((Date.now() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24));
            let status = "Donated";
            if (daysSince < 56) status = "Recovery";
            else status = "Eligible";

            return {
                _id: d._id,
                hospital: d.hospital || "Unknown Hospital",
                patientName: d.patientName || "Anonymous",
                units: d.units || 1,
                bloodGroup: d.bloodGroup,
                date: d.date,
                currentStage: d.currentStage,
                status,
                daysSince,
                journey: d.journey || [],
            };
        });

        res.json({
            success: true,
            data: {
                totalDonations,
                totalUnits,
                livesSaved,
                impactScore,
                badge,
                eligibility,
                streak,
                longestStreak,
                chartData,
                timeline,
            },
        });
    } catch (error) {
        console.error("Health Wallet Stats Error:", error);
        res.status(500).json({ success: false, message: "Failed to load health wallet stats." });
    }
};

// ─── POST /api/v1/health-wallet/fitness-check ────────────────────────────────
// Evaluates health readiness for donation based on user-submitted values
export const fitnessCheck = async (req, res) => {
    try {
        const { hemoglobin, weight, lastMealHoursAgo } = req.body;

        if (hemoglobin === undefined || weight === undefined || lastMealHoursAgo === undefined) {
            return res.status(400).json({ success: false, message: "hemoglobin, weight, and lastMealHoursAgo are required." });
        }

        const result = calculateFitnessScore({
            hemoglobin: parseFloat(hemoglobin),
            weight: parseFloat(weight),
            lastMealHoursAgo: parseFloat(lastMealHoursAgo),
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Fitness Check Error:", error);
        res.status(500).json({ success: false, message: "Failed to process fitness check." });
    }
};

// ─── POST /api/v1/health-wallet/log-donation ─────────────────────────────────
// Add a blood donation record and update user's lastDonation field
export const logDonationHW = async (req, res) => {
    try {
        const { patientName, hospital, bloodGroup, units, date } = req.body;
        const donationDate = date ? new Date(date) : new Date();

        const donation = await Donation.create({
            donor: req.user._id,
            bloodGroup: bloodGroup || req.user.bloodGroup,
            patientName,
            hospital,
            date: donationDate,
            units: parseInt(units) || 1,
            currentStage: "Donated",
            journey: [{
                stage: "Donated",
                timestamp: donationDate,
                message: `Donation of ${units || 1} unit(s) recorded at ${hospital}.`,
            }],
        });

        // Update user's lastDonation field for accurate eligibility tracking
        await User.findByIdAndUpdate(req.user._id, { lastDonation: donationDate });

        res.status(201).json({ success: true, data: donation });
    } catch (error) {
        console.error("Log Donation Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
