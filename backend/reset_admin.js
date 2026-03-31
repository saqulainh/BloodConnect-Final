import "dotenv/config";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import User from "./src/models/User.js";
import bcryptjs from "bcryptjs";

const NEW_PASSWORD = "BloodConnect2024";

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
        
        const users = await User.find({}).select("email role isVerified isBanned name").sort({ role: 1 });
        
        process.stdout.write("=== ALL USERS IN DATABASE ===\n");
        users.forEach((u, i) => {
            process.stdout.write(`${i+1}. EMAIL=[${u.email}] ROLE=[${u.role}] VERIFIED=[${u.isVerified}] BANNED=[${u.isBanned}]\n`);
        });
        
        // Reset ALL non-banned user passwords to make testing easy
        const adminUser = users.find(u => u.role === "admin");
        if (adminUser) {
            const salt = await bcryptjs.genSalt(10);
            const hashed = await bcryptjs.hash(NEW_PASSWORD, salt);
            await User.findByIdAndUpdate(adminUser._id, { password: hashed, isVerified: true, isBanned: false });
            process.stdout.write(`\n✅ RESET ADMIN: [${adminUser.email}] password => ${NEW_PASSWORD}\n`);
        } else {
            const firstUser = users[0];
            if (firstUser) {
                const salt = await bcryptjs.genSalt(10);
                const hashed = await bcryptjs.hash(NEW_PASSWORD, salt);
                await User.findByIdAndUpdate(firstUser._id, { password: hashed, isVerified: true, isBanned: false });
                process.stdout.write(`\n✅ RESET FIRST USER: [${firstUser.email}] password => ${NEW_PASSWORD}\n`);
            }
        }
        
    } catch (e) {
        process.stdout.write("ERROR: " + e.message + "\n");
    } finally {
        try { await mongoose.disconnect(); } catch {}
        process.stdout.write("Done.\n");
    }
}

main();
