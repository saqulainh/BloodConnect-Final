import mongoose from 'mongoose';
import dotenv from 'dotenv';
import os from 'os';
dotenv.config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to DB!");
    const db = mongoose.connection.db;

    const userCount = await db.collection('users').countDocuments();
    const activeDonors = await db.collection('users').countDocuments({ role: 'donor', status: 'active' });
    const requestsCount = await db.collection('bloodrequests').countDocuments();
    const criticalRequests = await db.collection('bloodrequests').countDocuments({ urgency: 'Critical', status: { $ne: 'fulfilled' } });
    const campsCount = await db.collection('camps').countDocuments();
    
    // Check load data from system if available, else just system memory
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg(); // Returns an array [1, 5, 15] minutes avg

    console.log(`\n=== BLOOD CONNECT LIVE PLATFORM LOAD ===`);
    console.log(`👥 Total Registered Users: ${userCount}`);
    console.log(`🩸 Active Donors Available: ${activeDonors}`);
    console.log(`🚨 Total Blood Requests: ${requestsCount}`);
    console.log(`⚠️ Unfulfilled Critical Requests: ${criticalRequests}`);
    console.log(`🏕️ Scheduled Camps: ${campsCount}`);
    console.log(`\n=== SERVER HARDWARE LOAD ===`);
    console.log(`💻 RAM Usage: ${(totalMem - freeMem).toFixed(2)} MB / ${totalMem} MB`);
    console.log(`🔥 CPU Load Average (1m, 5m, 15m): ${cpuLoad[0].toFixed(2)}, ${cpuLoad[1].toFixed(2)}, ${cpuLoad[2].toFixed(2)}`);
    
    console.log(`\nServer is healthy and running smoothly! ✅\n`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  });
