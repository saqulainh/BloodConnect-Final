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
        if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;

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
