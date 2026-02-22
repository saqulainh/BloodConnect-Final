import Message from "../models/Message.js";
import User from "../models/User.js";
import getPusher from "../utils/pusher.js";

// @desc    Send a message
// @route   POST /api/v1/chat/send/:id
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!text) {
            return res.status(400).json({ success: false, message: "Message text is required" });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
        });

        // Trigger pusher event for real-time delivery
        const pusher = getPusher();
        const channelName = `user-${receiverId}`;
        pusher.trigger(channelName, "new-message", {
            ...newMessage.toObject(),
            from: "other" // Or whatever standard helps frontend parse
        });

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

// @desc    Get chat history between current user and specified user
// @route   GET /api/v1/chat/history/:id
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Sort by chronological order

        // Mark messages as read (optional enhancement we can add later for now set all to read if sent by other)
        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: "Failed to load messages" });
    }
};

// @desc    Get list of conversations for current user
// @route   GET /api/v1/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherIdString = msg.senderId.toString() === userId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString();

            if (!conversationMap.has(otherIdString)) {
                conversationMap.set(otherIdString, msg);
            }
        }

        const conversationUserIds = Array.from(conversationMap.keys());

        // Fetch user basic details for conversations
        const users = await User.find(
            { _id: { $in: conversationUserIds } },
            "name profilePicture role"
        );

        // Map latest message to user
        const conversations = users.map(user => {
            return {
                user,
                lastMessage: conversationMap.get(user._id.toString())
            };
        });

        // Sort conversations by last message time
        conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Error in getConversations:", error.message);
        res.status(500).json({ success: false, message: "Failed to load conversations" });
    }
};
