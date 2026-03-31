import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Request from './src/models/Request.js';
import ReceiverWallet from './src/models/ReceiverWallet.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to local DB for checking/seeding.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("BloodConnect2024", salt);

    let receiver = await User.findOne({ email: "ss_receiver@bc.com" });
    if (!receiver) {
      console.log("Creating ss_receiver@bc.com...");
      receiver = await User.create({
        name: "Test Receiver",
        email: "ss_receiver@bc.com",
        password: hashedPassword,
        phone: "1231231234",
        role: "receiver",
        bloodGroup: "O+",
        location: {
            address: "New Delhi, India",
            coordinates: [77.2090, 28.6139],
            city: "New Delhi"
        }
      });
      console.log("Receiver created.");
    } else {
      receiver.password = hashedPassword;
      await receiver.save();
      console.log("Password reset for ss_receiver@bc.com to BloodConnect2024.");
    }
    
    // Create some seed data (Requests) to see it in Analytics and Timeline
    const numRequests = await Request.countDocuments({ requester: receiver._id });
    if (numRequests === 0) {
        console.log("Creating dummy requests for receiver...");
        // Active
        await Request.create({
            requester: receiver._id,
            patientName: "John Doe",
            bloodGroup: "O+",
            hospital: "AIIMS Delhi",
            city: "New Delhi",
            urgency: "Urgent",
            units: 2,
            location: { type: "Point", coordinates: [77.2090, 28.6139] },
            contactPhone: "9876543210",
        });
        
        let donorUser = await User.findOne({ email: "ss_donor@bc.com" });
        if(!donorUser) {
           donorUser = await User.create({
              name: "Hero Donor", email: "ss_donor@bc.com", password: hashedPassword, role: "donor", phone: "9876598765", bloodGroup: "O+"
           });
        }
        
        // Fulfilled
        const reqF = await Request.create({
            requester: receiver._id,
            patientName: "Jane Doe",
            bloodGroup: "O+",
            hospital: "Max Hospital",
            city: "New Delhi",
            urgency: "Critical",
            status: "Completed",
            units: 3,
            location: { type: "Point", coordinates: [77.2090, 28.6139] },
            resolvedAt: new Date(),
            fulfilledBy: donorUser._id
        });
        
        // Update wallet
        await ReceiverWallet.create({
            user: receiver._id,
            totalUnitsReceived: 3,
            totalRequestsMade: 2,
            totalRequestsFulfilled: 1,
            badgeLevel: "Newcomer",
            gratitudes: [],
            gratitudesSent: 0
        });
        console.log("Seeded requests and wallet.");
    }

    process.exit(0);
  })
  .catch(err => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
