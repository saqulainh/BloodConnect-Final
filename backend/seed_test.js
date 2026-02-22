import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js"; // Adjust path based on execution dir

dotenv.config({ path: "./.env" });

const seedUser = async () => {
    try {
        const DIRECT_URI = "mongodb://saqulain:Admin123@ac-n01y99w-shard-00-00.dlbkvog.mongodb.net:27017,ac-n01y99w-shard-00-01.dlbkvog.mongodb.net:27017,ac-n01y99w-shard-00-02.dlbkvog.mongodb.net:27017/khoon?ssl=true&replicaSet=atlas-2y4kq1-shard-0&authSource=admin&retryWrites=true&w=majority";
        await mongoose.connect(DIRECT_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Check if user exists
        const exists = await User.findOne({ email: "testuser@email.com" });
        if (exists) {
            console.log("Test user already exists. Updating properties...");
            exists.isVerified = true;
            exists.aadhaarVerified = true;
            exists.password = "password123";
            await exists.save();
            console.log("Updated testuser@email.com");
        } else {
            console.log("Creating new test user...");
            await User.create({
                name: "Test User",
                email: "testuser@email.com",
                password: "password123", // the model hooks will hash it
                phone: "1234567890",
                bloodGroup: "A+",
                role: "donor",
                isVerified: true,
                aadhaarVerified: true,
                aadhaarNumber: "123412341234"
            });
            console.log("Created testuser@email.com");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUser();
