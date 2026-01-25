require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const resetPassword = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'adi@iitrpr.ac.in';
        const newPassword = 'password123';

        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found. Creating...`);
            // Create if not exists (fallback)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user = new User({
                name: 'Aditya Gupta',
                email: email,
                password: hashedPassword,
                role: 'student',
                rollNumber: '2023CSB1143', // Dummy roll number
                department: 'Computer Science and Engineering',
                isVerified: true
            });
            await user.save();
            console.log(`User created with password: ${newPassword}`);
        } else {
            console.log(`User found: ${user.name}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            console.log(`Password reset to: ${newPassword}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
