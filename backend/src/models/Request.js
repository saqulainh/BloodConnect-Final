import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    hospital: { type: String, required: true },
    urgency: { type: String, enum: ["Normal", "Urgent", "Critical"], default: "Normal" },
    units: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Completed", "Cancelled"], default: "Active" },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
    },
    fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Request = mongoose.model("Request", requestSchema);
export default Request;
