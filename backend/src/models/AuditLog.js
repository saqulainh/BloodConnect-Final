import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        index: true
        // e.g. "USER_BANNED", "REQUEST_FORCE_FULFILLED", "CAMP_CREATED", etc.
    },
    targetType: {
        type: String,
        enum: ["User", "Request", "Camp", "Payment", "System", "Broadcast"],
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    details: {
        type: String,
        default: "",
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

// Index for efficient querying by time
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
