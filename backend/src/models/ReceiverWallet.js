import mongoose from "mongoose";

const gratitudeSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, default: "Thank you for saving a life! 🙏" },
    sentAt: { type: Date, default: Date.now },
});

const receiverWalletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },
    totalUnitsReceived: { type: Number, default: 0 },
    totalRequestsMade: { type: Number, default: 0 },
    totalRequestsFulfilled: { type: Number, default: 0 },
    avgFulfillmentTimeHours: { type: Number, default: 0 },
    gratitudesSent: { type: Number, default: 0 },
    gratitudes: [gratitudeSchema],
    // Badge progression: Newcomer → Survivor → Recovery Champion → Life Warrior → Miracle Hero
    badgeLevel: {
        type: String,
        enum: ["Newcomer", "Survivor", "Recovery Champion", "Life Warrior", "Miracle Hero"],
        default: "Newcomer"
    },
}, { timestamps: true });

const ReceiverWallet = mongoose.model("ReceiverWallet", receiverWalletSchema);
export default ReceiverWallet;
