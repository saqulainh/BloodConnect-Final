import mongoose from "mongoose";

const bloodTransitSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", index: true },
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    
    patientName: { type: String, required: true },
    donorName: { type: String, default: "Volunteer Donor" },
    hospitalName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1 },

    status: {
        type: String,
        enum: ["pending_pickup", "assigned", "en_route_pickup", "picked_up", "in_transit", "delivered", "cancelled"],
        default: "pending_pickup",
        index: true
    },

    pickupLocation: {
        address: { type: String, default: "Blood Donation Camp / Donor Location" },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    destinationLocation: {
        hospital: { type: String, required: true },
        address: { type: String, default: "Hospital Emergency Blood Bank" },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },

    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        updatedAt: { type: Date, default: Date.now },
        heading: { type: Number, default: 0 }
    },

    // Medical Cold Chain (Safe range 2°C - 6°C for whole blood / packed RBCs)
    coldChain: {
        currentTemp: { type: Number, default: 4.0 },
        minTemp: { type: Number, default: 2.0 },
        maxTemp: { type: Number, default: 6.0 },
        status: { type: String, enum: ["safe", "warning", "breached"], default: "safe" },
        sealNumber: { type: String, default: "" },
        tempLogs: [{
            temp: Number,
            status: String,
            timestamp: { type: Date, default: Date.now }
        }]
    },

    // Dual-OTP Handshake Chain of Custody
    pickupOtp: { type: String }, // Provided by Donor to Volunteer
    deliveryOtp: { type: String }, // Provided by Hospital/Receiver to Volunteer

    etaMinutes: { type: Number, default: 15 },
    distanceKm: { type: Number, default: 4.5 },
    notes: { type: String, default: "" },

    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },

    timeline: [{
        status: { type: String },
        title: { type: String },
        description: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const BloodTransit = mongoose.model("BloodTransit", bloodTransitSchema);
export default BloodTransit;
