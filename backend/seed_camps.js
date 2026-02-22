import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import Camp from "./src/models/Camp.js";
import User from "./src/models/User.js";

dotenv.config();

const DIRECT_URI = "mongodb://saqulain:Admin123@ac-n01y99w-shard-00-00.dlbkvog.mongodb.net:27017,ac-n01y99w-shard-00-01.dlbkvog.mongodb.net:27017,ac-n01y99w-shard-00-02.dlbkvog.mongodb.net:27017/khoon?ssl=true&replicaSet=atlas-2y4kq1-shard-0&authSource=admin&retryWrites=true&w=majority";

const seedCamps = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(DIRECT_URI);
        console.log("Connected.");

        await Camp.deleteMany({});
        console.log("Cleared old camps.");

        const adminUser = await User.findOne({ email: "testuser@email.com" });
        if (!adminUser) {
            const errObj = "No testuser@email.com found. Please ensure users exist before seeding camps.";
            fs.writeFileSync("seed_error.txt", errObj);
            process.exit(1);
        }

        const camps = [
            {
                name: "City Central Blood Drive",
                organizer: "Red Cross Society",
                date: new Date("2026-03-15"),
                time: "09:00 AM - 04:00 PM",
                location: "Central Park Community Hall",
                status: "Upcoming",
                createdBy: adminUser._id
            },
            {
                name: "University Mega Camp",
                organizer: "Student Union",
                date: new Date("2026-03-22"),
                time: "10:00 AM - 05:00 PM",
                location: "Main Campus Auditorium",
                status: "Upcoming",
                createdBy: adminUser._id
            },
            {
                name: "Tech Park Donation Drive",
                organizer: "IT Welfare Association",
                date: new Date("2026-04-05"),
                time: "09:30 AM - 06:00 PM",
                location: "Tech Park Block A, Lobby",
                status: "Planning",
                createdBy: adminUser._id
            }
        ];

        await Camp.insertMany(camps);
        fs.writeFileSync("seed_success.txt", "Successfully seeded upcoming camps!");
        console.log("Success");
        process.exit(0);

    } catch (error) {
        fs.writeFileSync("seed_error.txt", error.stack || error.toString());
        process.exit(1);
    }
};

seedCamps();
