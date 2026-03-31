import mongoose from 'mongoose';
import dns from 'node:dns';
dns.setServers(["1.1.1.1", "1.0.0.1"]);
import dotenv from 'dotenv';
dotenv.config();

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
