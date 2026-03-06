import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const cleanDonations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        console.log("Dropping ALL indexes in donations (except _id)...");
        try {
            // Drop indexes using the command
            const result = await db.collection("donations").dropIndexes();
            console.log("Result:", result);
        } catch (e) {
            console.log("Error dropping indexes:", e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

cleanDonations();
