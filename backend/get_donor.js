import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const user = await mongoose.connection.collection('users').findOne({ role: 'donor' });
    console.log("Found donor:", user.email);
    process.exit(0);
}).catch(console.error);
