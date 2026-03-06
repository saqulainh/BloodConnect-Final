import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
dotenv.config();

// Force Google DNS to bypass ISP blocking of MongoDB SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('SUCCESS: Connected to MongoDB Cloud');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name).join(', '));
        const userCount = await db.collection('users').countDocuments();
        console.log('User Count:', userCount);
        const users = await db.collection('users').find({}).limit(5).toArray();
        console.log('Sample User Emails:', users.map(u => u.email).join(', '));
    } catch (error) {
        console.log('FAILURE:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
