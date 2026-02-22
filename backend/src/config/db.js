import mongoose from "mongoose";
import dns from "node:dns";

// Force Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to Cloud DB: ${error.message}`);
        try {
            console.log("Attempting to connect to Local MongoDB...");
            const conn = await mongoose.connect("mongodb://127.0.0.1:27017/blood-connect");
            console.log(`Local MongoDB Connected: ${conn.connection.host}`);
        } catch (localError) {
            console.error(`Local DB Error: ${localError.message}`);
            process.exit(1);
        }
    }
};
