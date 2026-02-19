import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["donor", "receiver", "admin"], default: "donor" },
    bloodGroup: { type: String, required: true },
    aadhaarNumber: { type: String, required: true }, // In a real app, encrypt this field
    address: { type: String },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" } // [lng, lat]
    },
    aadhaarImage: { type: String },
    medicalCertificate: { type: String },
    profilePicture: { type: String },
    availability: { type: Boolean, default: true },
    lastDonation: { type: Date },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
