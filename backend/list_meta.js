import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: "./.env" });

const listMetadata = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name).join(", "));

        for (const coll of collections) {
            const indexes = await db.collection(coll.name).indexes();
            console.log(`Indexes for ${coll.name}:`, JSON.stringify(indexes, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

listMetadata();
