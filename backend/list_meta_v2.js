import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import dns from "node:dns";
dns.setServers(["8.8.8.4", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const listMetadata = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const out = {};
        const collections = await db.listCollections().toArray();
        for (const coll of collections) {
            out[coll.name] = await db.collection(coll.name).indexes();
        }
        fs.writeFileSync("db_meta_full.json", JSON.stringify(out, null, 2), "utf-8");
        console.log("Wrote full database metadata to db_meta_full.json");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

listMetadata();
