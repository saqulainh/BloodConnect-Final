import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const inspectIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const indexes = await db.collection("donations").indexes();
        fs.writeFileSync("index_output.json", JSON.stringify(indexes, null, 2));
        console.log("Wrote indexes to index_output.json");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};
inspectIndex();
