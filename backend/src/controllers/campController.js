import Camp from "../models/Camp.js";

// @desc    Create a blood camp
// @route   POST /api/v1/camps
// @access  Private
const createCamp = async (req, res) => {
    try {
        const { name, organizer, date, time, location } = req.body;
        const camp = await Camp.create({
            name, organizer, date, time, location,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: camp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all camps
// @route   GET /api/v1/camps
// @access  Public
const getCamps = async (req, res) => {
    try {
        const camps = await Camp.find().sort({ date: 1 });
        res.json({ success: true, data: camps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register for a camp
// @route   POST /api/v1/camps/:id/register
// @access  Private
const registerForCamp = async (req, res) => {
    try {
        const { id } = req.params;
        const camp = await Camp.findById(id);

        if (!camp) return res.status(404).json({ success: false, message: "Camp not found" });

        // Check if already registered
        if (camp.registeredDonors.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: "You are already registered for this camp" });
        }

        camp.registeredDonors.push(req.user._id);
        await camp.save();
        res.json({ success: true, message: "Successfully registered for camp", data: camp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { createCamp, getCamps, registerForCamp };
