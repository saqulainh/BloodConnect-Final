import Camp from "../models/Camp.js";

// @desc    Create a blood camp
// @route   POST /api/v1/camps
// @access  Private
const createCamp = async (req, res) => {
    try {
        const { name, organizer, date, time, location, lat, lng } = req.body;

        // Input validation
        if (!name || !organizer || !date || !time || !location) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: name, organizer, date, time, location.",
            });
        }

        // Date must be in the future
        if (new Date(date) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Camp date must be in the future.",
            });
        }

        const campData = {
            name: name.trim(),
            organizer: organizer.trim(),
            date,
            time: time.trim(),
            location: location.trim(),
            createdBy: req.user._id,
        };

        // Add GeoJSON coordinates if provided
        if (lat !== undefined && lng !== undefined) {
            campData.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        const camp = await Camp.create(campData);
        res.status(201).json({ success: true, data: camp });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all camps (with pagination & optional proximity sorting)
// @route   GET /api/v1/camps
// @access  Public
const getCamps = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const { lat, lng } = req.query;

        // If coordinates are provided, use $near to sort by closest
        if (lat && lng) {
            filter.coordinates = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    }
                }
            };

            // Note: $near implicitly sorts by distance, so we don't chain .sort()
            const [camps, total] = await Promise.all([
                Camp.find(filter).skip(skip).limit(limit),
                Camp.countDocuments({ status: filter.status }) // Don't count $near to get total
            ]);

            return res.json({
                success: true,
                data: camps,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        }

        // Standard retrieval
        const [camps, total] = await Promise.all([
            Camp.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
            Camp.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: camps,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
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

        if (camp.status === "Completed" || camp.status === "Cancelled") {
            return res.status(400).json({ success: false, message: "This camp is no longer accepting registrations." });
        }

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

// @desc    Unregister from a camp
// @route   DELETE /api/v1/camps/:id/unregister
// @access  Private
const unregisterFromCamp = async (req, res) => {
    try {
        const camp = await Camp.findById(req.params.id);
        if (!camp) return res.status(404).json({ success: false, message: "Camp not found" });

        const idx = camp.registeredDonors.indexOf(req.user._id);
        if (idx === -1) {
            return res.status(400).json({ success: false, message: "You are not registered for this camp." });
        }

        camp.registeredDonors.splice(idx, 1);
        await camp.save();
        res.json({ success: true, message: "Successfully unregistered from camp." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { createCamp, getCamps, registerForCamp, unregisterFromCamp };

