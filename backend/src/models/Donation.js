import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    patientName: { type: String },
    hospital: { type: String },
    bloodGroup: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now },
    units: { type: Number, default: 1 },
    currentStage: {
        type: String,
        enum: ["Donated", "Processing", "Tested", "Transferred", "Life Saved"],
        default: "Donated",
        index: true
    },
    journey: [
        {
            stage: { type: String },
            timestamp: { type: Date, default: Date.now },
            message: { type: String }
        }
    ]
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
