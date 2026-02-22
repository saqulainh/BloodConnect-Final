import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: String,
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR",
    },
    status: {
        type: String,
        enum: ["created", "success", "failed"],
        default: "created",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
