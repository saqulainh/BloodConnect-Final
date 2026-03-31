import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import bcryptjs from "bcryptjs";

async function main() {
    try {
        // Use a direct connection with a longer timeout
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
        });
        console.log("✅ Connected!\n");
        
        // List all users
        const users = await User.find({}).select("email role isVerified isBanned name").limit(20);
        console.log(`Found ${users.length} users in DB:`);
        users.forEach(u => {
            console.log(`  📧 ${u.email} | role: ${u.role} | verified: ${u.isVerified} | banned: ${u.isBanned} | name: ${u.name}`);
        });
        
        if (users.length === 0) {
            console.log("  ⚠️  No users found! Creating a test user...");
        }
        
    } catch (e) {
        console.error("❌ ERROR:", e.message);
        if (e.message.includes("ECONNREFUSED") || e.message.includes("querySrv")) {
            console.log("\n🔧 Tip: MongoDB Atlas DNS resolution is failing.");
            console.log("   Try: Check your internet/VPN, or whitelist your IP on Atlas (Network Access).");
        }
    } finally {
        try { await mongoose.disconnect(); } catch {}
        console.log("\nDone.");
    }
}

main();
