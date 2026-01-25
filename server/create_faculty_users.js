require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const createFacultyUsers = async () => {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // Faculty 1: Dr. Amit Kumar - Computer Science
        const password1 = 'faculty123';
        const salt1 = await bcrypt.genSalt(10);
        const hashedPassword1 = await bcrypt.hash(password1, salt1);

        const faculty1 = new User({
            name: 'Dr. Amit Kumar',
            email: 'amit.kumar@iitrpr.ac.in',
            password: hashedPassword1,
            department: 'Computer Science and Engineering',
            role: 'instructor',
            isVerified: true,
            pfp: 'https://ui-avatars.com/api/?name=Dr.+Amit+Kumar&background=random'
        });

        // Faculty 2: Dr. Priya Sharma - Electronics and Communication
        const password2 = 'faculty123';
        const salt2 = await bcrypt.genSalt(10);
        const hashedPassword2 = await bcrypt.hash(password2, salt2);

        const faculty2 = new User({
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@iitrpr.ac.in',
            password: hashedPassword2,
            department: 'Electronics and Communication Engineering',
            role: 'instructor',
            isVerified: true,
            pfp: 'https://ui-avatars.com/api/?name=Dr.+Priya+Sharma&background=random'
        });

        // Check if they already exist
        const existing1 = await User.findOne({ email: faculty1.email });
        const existing2 = await User.findOne({ email: faculty2.email });

        if (existing1) {
            console.log('❌ Dr. Amit Kumar already exists in database');
        } else {
            await faculty1.save();
            console.log('✅ Created Dr. Amit Kumar (CS Department)');
            console.log('   Email: amit.kumar@iitrpr.ac.in');
            console.log('   Password: faculty123');
        }

        if (existing2) {
            console.log('❌ Dr. Priya Sharma already exists in database');
        } else {
            await faculty2.save();
            console.log('✅ Created Dr. Priya Sharma (ECE Department)');
            console.log('   Email: priya.sharma@iitrpr.ac.in');
            console.log('   Password: faculty123');
        }

        console.log('\n=== Faculty Users Created Successfully ===');
        console.log('You can now login with these credentials on the frontend.\n');

        // Display all users
        const allUsers = await User.find({});
        console.log(`Total users in database: ${allUsers.length}`);
        allUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.role}) - ${user.email}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

createFacultyUsers();
