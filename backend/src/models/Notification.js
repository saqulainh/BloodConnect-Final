import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["system", "broadcast", "request", "camp", "match", "reward"],
        default: "system"
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    // For global broadcasts that apply to everyone (user field will be null)
    isGlobal: {
        type: Boolean,
        default: false,
        index: true
    },
    link: {
        type: String
    } // Optional URL to redirect when clicked
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
