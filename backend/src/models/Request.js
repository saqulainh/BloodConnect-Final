import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true, index: true }, // Index for filtering
    hospital: { type: String, required: true },
    urgency: { type: String, enum: ["Normal", "Urgent", "Critical"], default: "Normal", index: true },
    urgencyLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
        index: true
    },
    urgencyScore: { type: Number, default: 20 },
    units: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Completed", "Cancelled"], default: "Active", index: true },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
    },
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date }
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
export default Request;
