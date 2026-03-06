import mongoose from "mongoose";
import dns from "node:dns";

// Force Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ── Connection Pool Settings (for 10,000+ users) ─────────────────────
const DB_OPTIONS = {
    maxPoolSize: 50,               // Max 50 concurrent connections
    minPoolSize: 5,                // Keep 5 warm connections ready
    socketTimeoutMS: 45000,        // Close idle sockets after 45s
    connectTimeoutMS: 10000,       // Connection attempt timeout 10s
    retryWrites: true,             // Auto retry failed writes
    retryReads: true,              // Auto retry failed reads
    serverSelectionTimeoutMS: 5000,
};

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, DB_OPTIONS);
        console.log(`MongoDB Connected: ${conn.connection.host} (Pool: ${DB_OPTIONS.maxPoolSize})`);
    } catch (error) {
        console.error(`Error connecting to Cloud DB: ${error.message}`);
        try {
            console.log("Attempting to connect to Local MongoDB...");
            const conn = await mongoose.connect("mongodb://127.0.0.1:27017/blood-connect", DB_OPTIONS);
            console.log(`Local MongoDB Connected: ${conn.connection.host}`);
        } catch (localError) {
            console.error(`Local DB Error: ${localError.message}`);
            process.exit(1);
        }
    }

    // Connection monitoring
    mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected. Reconnecting..."));
};
