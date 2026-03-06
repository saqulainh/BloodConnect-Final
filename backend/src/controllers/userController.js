import User from "../models/User.js";

// @desc    Update user profile & settings
// @route   PATCH /api/v1/users/update-me
// @access  Private
export const updateMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update fields if provided
        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.bloodGroup) user.bloodGroup = req.body.bloodGroup;
        if (req.body.address) user.address = req.body.address;
        // Validate Profile Picture URL (prevent XSS via javascript: or data: URIs)
        if (req.body.profilePicture) {
            const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;
            const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/.+/i;

            if (typeof req.body.profilePicture !== "string" ||
                (!urlPattern.test(req.body.profilePicture) && !cloudinaryPattern.test(req.body.profilePicture))) {
                return res.status(400).json({ success: false, message: "Invalid profile picture URL." });
            }
            user.profilePicture = req.body.profilePicture;
        }

        // Availability toggle (booleans can be false, so check if undefined)
        if (req.body.availability !== undefined) {
            user.availability = req.body.availability;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                bloodGroup: updatedUser.bloodGroup,
                address: updatedUser.address,
                availability: updatedUser.availability,
                profilePicture: updatedUser.profilePicture,
                aadhaarVerified: updatedUser.aadhaarVerified,
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: "Server error while updating profile." });
    }
};

// @desc    Get all donors (with pagination + search)
// @route   GET /api/v1/users/donors
// @access  Private
export const getDonors = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { role: "donor" };
        if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
        if (req.query.availability !== undefined) filter.availability = req.query.availability === "true";
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: "i" };
        }

        const [donors, total] = await Promise.all([
            User.find(filter)
                .select("-password -aadhaarNumber -otp -otpExpires")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: donors,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Fetch donors error:", error);
        res.status(500).json({ success: false, message: "Server error fetching donors." });
    }
};
