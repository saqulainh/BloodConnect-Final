import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: { type: String, required: true },
    patientName: { type: String, required: true },
    hospital: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
    units: { type: Number, default: 1, required: true },
    status: { type: String, enum: ['Verified', 'Pending'], default: 'Verified' }
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
