import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@pawdoption.local';
        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        const admin = new User({
            fullname: 'PAWdoption Admin',
            email: adminEmail,
            password: 'Admin@123',
            role: 'admin'
        });
        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();