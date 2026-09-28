import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital / Blood Bank name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Government Hospital", "Private Hospital", "Red Cross Blood Bank", "Charitable Blood Bank", "Stand-Alone Blood Bank"],
      default: "Government Hospital",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    emergencyNumber: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    operatingHours: {
      type: String,
      default: "24x7 Emergency Services",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    bloodStock: {
      "A+": { type: Number, default: 0, min: 0 },
      "A-": { type: Number, default: 0, min: 0 },
      "B+": { type: Number, default: 0, min: 0 },
      "B-": { type: Number, default: 0, min: 0 },
      "AB+": { type: Number, default: 0, min: 0 },
      "AB-": { type: Number, default: 0, min: 0 },
      "O+": { type: Number, default: 0, min: 0 },
      "O-": { type: Number, default: 0, min: 0 },
    },
    lastStockUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ name: "text", city: "text", state: "text", address: "text" });

const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", hospitalSchema);

export default Hospital;
