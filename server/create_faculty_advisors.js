require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

// Faculty Advisors - One per department
const facultyAdvisors = [
    {
        name: 'Dr. Ramesh Kumar (FA)',
        email: 'fa.cs@iitrpr.ac.in',
        department: 'Computer Science and Engineering',
        password: 'fa123'
    },
    {
        name: 'Dr. Sunita Verma (FA)',
        email: 'fa.ece@iitrpr.ac.in',
        department: 'Electronics and Communication Engineering',
        password: 'fa123'
    },
    {
        name: 'Dr. Anil Sharma (FA)',
        email: 'fa.me@iitrpr.ac.in',
        department: 'Mechanical Engineering',
        password: 'fa123'
    },
    {
        name: 'Dr. Preeti Singh (FA)',
        email: 'fa.ce@iitrpr.ac.in',
        department: 'Civil Engineering',
        password: 'fa123'
    },
    {
        name: 'Dr. Vikram Patel (FA)',
        email: 'fa.che@iitrpr.ac.in',
        department: 'Chemical Engineering',
        password: 'fa123'
    },
    {
        name: 'Dr. Meera Reddy (FA)',
        email: 'fa.bt@iitrpr.ac.in',
        department: 'Biotechnology',
        password: 'fa123'
    },
    {
        name: 'Dr. Sandeep Gupta (FA)',
        email: 'fa.math@iitrpr.ac.in',
        department: 'Mathematics',
        password: 'fa123'
    },
    {
        name: 'Dr. Anjali Desai (FA)',
        email: 'fa.hss@iitrpr.ac.in',
        department: 'Humanities and Social Sciences',
        password: 'fa123'
    }
];

const createFacultyAdvisors = async () => {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        console.log('=== Creating Faculty Advisors ===\n');

        let createdCount = 0;
        let existingCount = 0;

        for (const faData of facultyAdvisors) {
            // Check if already exists
            const existing = await User.findOne({ email: faData.email });

            if (existing) {
                console.log(`❌ ${faData.name} already exists`);
                console.log(`   Email: ${faData.email}`);
                console.log(`   Department: ${faData.department}\n`);
                existingCount++;
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(faData.password, salt);

            // Create FA user
            const fa = new User({
                name: faData.name,
                email: faData.email,
                password: hashedPassword,
                department: faData.department,
                role: 'faculty_advisor',
                isVerified: true,
                pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(faData.name)}&background=random`
            });

            await fa.save();
            console.log(`✅ Created ${faData.name}`);
            console.log(`   Email: ${faData.email}`);
            console.log(`   Password: ${faData.password}`);
            console.log(`   Department: ${faData.department}\n`);
            createdCount++;
        }

        console.log('=== Summary ===');
        console.log(`Created: ${createdCount}`);
        console.log(`Already existing: ${existingCount}`);
        console.log(`Total FAs: ${facultyAdvisors.length}\n`);

        // Display all faculty advisors in database
        const allFAs = await User.find({ role: 'faculty_advisor' });
        console.log(`=== All Faculty Advisors in Database (${allFAs.length} total) ===`);
        allFAs.forEach(fa => {
            console.log(`  - ${fa.name}`);
            console.log(`    ${fa.email} | ${fa.department}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

createFacultyAdvisors();
