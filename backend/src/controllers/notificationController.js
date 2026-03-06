import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Get current user's notifications (includes personal + global)
// @route   GET /api/v1/notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        // Fetch user's personal notifications OR global broadcasts
        const filter = {
            $or: [
                { user: req.user._id },
                { isGlobal: true }
            ]
        };

        const [notifications, unreadCount, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            // Unread count is personal unread + global unread
            // Note: In a real system, tracking reads on global broadcasts requires a separate tracking table 
            // per user. For simplicity here, we assume global broadcasts are shown until dismissed.
            Notification.countDocuments({ user: req.user._id, isRead: false }),
            Notification.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                list: notifications,
                unreadCount,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all personal notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
