import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Find the env file
import fs from 'fs';
import path from 'path';

// Check multiple possible env locations
const envPaths = ['.env', '../.env', 'src/.env'];
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        console.log('Found env at:', p);
        dotenv.config({ path: p });
    }
}

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

import User from './src/models/User.js';

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // List existing users
        const users = await User.find({}, 'name email role isVerified').limit(10);
        console.log('Existing users:');
        users.forEach(u => console.log(`  ${u.email} | role: ${u.role} | verified: ${u.isVerified}`));

        // Create receiver user if not exists
        const receiverExists = await User.findOne({ email: 'receiver_test@bc.com' });
        if (!receiverExists) {
            await User.create({
                name: 'Test Receiver',
                email: 'receiver_test@bc.com',
                password: 'Test@123',
                phone: '9876500001',
                bloodGroup: 'O+',
                role: 'receiver',
                aadhaarNumber: '345678901234',
                isVerified: true,
            });
            console.log('Created receiver user: receiver_test@bc.com / Test@123');
        } else {
            // Make sure it's verified
            receiverExists.isVerified = true;
            await receiverExists.save();
            console.log('Receiver user already exists, ensured verified');
        }

        // Create admin user if not exists
        const adminExists = await User.findOne({ email: 'admin_test@bc.com' });
        if (!adminExists) {
            await User.create({
                name: 'Test Admin',
                email: 'admin_test@bc.com',
                password: 'Test@123',
                phone: '9876500002',
                bloodGroup: 'A+',
                role: 'admin',
                aadhaarNumber: '456789012345',
                isVerified: true,
            });
            console.log('Created admin user: admin_test@bc.com / Test@123');
        } else {
            adminExists.isVerified = true;
            await adminExists.save();
            console.log('Admin user already exists, ensured verified');
        }

        // Also ensure existing donor is verified
        const donor = await User.findOne({ role: 'donor', isVerified: true });
        if (donor) {
            console.log('Found verified donor:', donor.email);
        }

        console.log('\nDone! You can now login with:');
        console.log('  Receiver: receiver_test@bc.com / Test@123');
        console.log('  Admin:    admin_test@bc.com / Test@123 (admin key: BLOODCONNECT_ADMIN_2026)');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
