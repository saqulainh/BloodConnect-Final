import mongoose from "mongoose";

const campSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['Planning', 'Upcoming', 'Active', 'Completed', 'Cancelled'], default: 'Upcoming' },
    registeredDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Camp = mongoose.model("Camp", campSchema);
export default Camp;
