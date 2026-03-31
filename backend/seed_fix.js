import mongoose from 'mongoose';
import dns from 'node:dns';
dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const MONGODB_URI="mongodb+srv://saqulain:Admin123@cluster0.dlbkvog.mongodb.net/khoon?appName=Cluster0";

mongoose.connect(MONGODB_URI).then(async () => {
    import('bcryptjs').then(async (bcrypt) => {
        const hash = await bcrypt.default.hash("Test@123", 10);
        
        await mongoose.connection.collection('users').updateOne(
            { role: 'donor' }, 
            { $set: { email: 'donor@bc.com', password: hash, isVerified: true } }
        );
        console.log("Updated a donor to donor@bc.com / Test@123");
        
        await mongoose.connection.collection('users').updateOne(
            { role: 'receiver' }, 
            { $set: { email: 'receiver@bc.com', password: hash, isVerified: true } }
        );
        console.log("Updated a receiver to receiver@bc.com / Test@123");

        process.exit(0);
    });
}).catch(console.error);
