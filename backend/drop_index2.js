import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        console.log("Dropping orderId_1 from donations collection...");
        try {
            await db.collection("donations").dropIndex("orderId_1");
            console.log("Successfully dropped index orderId_1");
        } catch (e) {
            console.log("Index drop error:", e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

dropIndex();
