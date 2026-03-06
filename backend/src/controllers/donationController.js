import Donation from "../models/Donation.js";

// @desc    Add a past donation record
// @route   POST /api/v1/donations
// @access  Private
const addDonation = async (req, res) => {
    try {
        const { patientName, hospital, date, units, bloodGroup } = req.body;

        // Input validation
        const bg = bloodGroup || req.user.bloodGroup;
        if (!bg) {
            return res.status(400).json({ success: false, message: "Blood group is required." });
        }

        const parsedUnits = parseInt(units) || 1;
        if (parsedUnits < 1 || parsedUnits > 10) {
            return res.status(400).json({ success: false, message: "Units must be between 1 and 10." });
        }

        const donationDate = date ? new Date(date) : new Date();
        if (donationDate > new Date()) {
            return res.status(400).json({ success: false, message: "Donation date cannot be in the future." });
        }

        const donation = await Donation.create({
            donor: req.user._id,
            bloodGroup: bg,
            patientName: patientName?.trim() || "Unknown",
            hospital: hospital?.trim() || "Unknown",
            date: donationDate,
            units: parsedUnits,
            currentStage: 'Donated',
            journey: [{
                stage: 'Donated',
                timestamp: donationDate,
                message: `Donation of ${parsedUnits} unit(s) recorded at ${hospital || "hospital"}.`
            }]
        });

        res.status(201).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user's donations (with pagination)
// @route   GET /api/v1/donations/my-donations
// @access  Private
const getMyDonations = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        const [records, total, totalUnitsAgg] = await Promise.all([
            Donation.find({ donor: req.user._id }).sort({ date: -1 }).skip(skip).limit(limit),
            Donation.countDocuments({ donor: req.user._id }),
            Donation.aggregate([
                { $match: { donor: req.user._id } },
                { $group: { _id: null, totalUnits: { $sum: "$units" } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                records,
                totalDonations: total,
                totalUnits: totalUnitsAgg[0]?.totalUnits || 0,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addDonation, getMyDonations };

