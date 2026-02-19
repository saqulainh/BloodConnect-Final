import mongoose from "mongoose";

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
