import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const inspectIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        try {
            await db.collection("donations").dropIndex({ orderId: 1 });
            console.log("Dropped by key pattern!");
        } catch (e) {
            console.log("Could not drop by key:", e.message);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};
inspectIndex();
