import mongoose from 'mongoose';

const MONGODB_URI="mongodb+srv://saqulain:Admin123@cluster0.dlbkvog.mongodb.net/khoon?appName=Cluster0";

mongoose.connect(MONGODB_URI).then(async () => {
    const user = await mongoose.connection.collection('users').findOne({ role: 'donor' });
    console.log("Found donor:", user.email);
    // Also let's change its password to Test@123 using bcrypt
    import('bcryptjs').then(async (bcrypt) => {
        const hash = await bcrypt.default.hash("Test@123", 10);
        await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { password: hash } });
        console.log("Password updated to Test@123 for", user.email);
        
        // Also get an admin
        const admin = await mongoose.connection.collection('users').findOne({ role: 'admin' });
        if(admin) {
            await mongoose.connection.collection('users').updateOne({ _id: admin._id }, { $set: { password: hash } });
            console.log("Admin found:", admin.email);
        }
        
        // Also receiver
        const receiver = await mongoose.connection.collection('users').findOne({ role: 'receiver' });
        if(receiver) {
            await mongoose.connection.collection('users').updateOne({ _id: receiver._id }, { $set: { password: hash } });
            console.log("Receiver found:", receiver.email);
        }

        process.exit(0);
    });
}).catch(err => {
    console.error("Connect error", err);
    process.exit(1);
});
