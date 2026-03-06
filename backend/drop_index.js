import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // List all indexes on the donations collection
        const indexes = await db.collection("donations").indexes();
        console.log("Indexes in donations collection:", indexes.map(idx => idx.name));

        // Check if orderId_1 exists and drop it
        if (indexes.find(idx => idx.name === "orderId_1")) {
            await db.collection("donations").dropIndex("orderId_1");
            console.log("Successfully dropped index orderId_1");
        } else {
            console.log("Index orderId_1 not found.");
        }

        // Optionally, do the same for Payments if needed
        const pIndexes = await db.collection("payments").indexes();
        console.log("Indexes in payments collection:", pIndexes.map(idx => idx.name));

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

dropIndex();
