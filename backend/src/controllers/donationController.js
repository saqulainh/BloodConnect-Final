import Donation from "../models/Donation.js";

// @desc    Add a past donation record
// @route   POST /api/v1/donations
// @access  Private
const addDonation = async (req, res) => {
    try {
        const { patientName, hospital, date, units, bloodGroup } = req.body;
        const donationDate = date ? new Date(date) : new Date();

        const donation = await Donation.create({
            donor: req.user._id,
            bloodGroup: bloodGroup || req.user.bloodGroup,
            patientName,
            hospital,
            date: donationDate,
            units
        });

        res.status(201).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user's donations
// @route   GET /api/v1/donations/my-donations
// @access  Private
const getMyDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id }).sort({ date: -1 });
        // Calculate total units
        const totalUnits = donations.reduce((acc, curr) => acc + curr.units, 0);

        res.json({
            success: true,
            data: {
                records: donations,
                totalDonations: donations.length,
                totalUnits
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addDonation, getMyDonations };
