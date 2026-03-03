import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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
    // For tax receipt generation
    donorName: { type: String, default: "Anonymous" },
    donorEmail: { type: String, default: "" },
    donorPhone: { type: String, default: "" },
    receiptGenerated: { type: Boolean, default: false },
    receiptNumber: { type: String },
}, { timestamps: true });

// Auto-generate receipt number before save
paymentSchema.pre("save", function (next) {
    if (!this.receiptNumber) {
        const year = new Date().getFullYear();
        this.receiptNumber = `BC-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    next();
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
