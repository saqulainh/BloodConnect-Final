import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const inspectIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const indexes = await db.collection("donations").indexes();
        console.log("Indexes full output:", JSON.stringify(indexes, null, 2));
        try {
            await db.collection("donations").dropIndex("orderId_1"); // or whatever the name is based on keys
            console.log("Dropped by name");
        } catch (e) {
            console.log("Could not drop by name:", e.message);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};
inspectIndex();
