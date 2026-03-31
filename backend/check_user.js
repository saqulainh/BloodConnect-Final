import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ role: 'donor' }).limit(10);
        console.log('--- FOUND DONORS ---');
        users.forEach(u => {
            console.log(`- Email: ${u.email}, Verified: ${u.isVerified}, Banned: ${u.isBanned}`);
        });
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

check();
