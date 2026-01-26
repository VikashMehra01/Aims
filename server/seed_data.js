require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');

const seedData = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Create Hash for password "1234"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt);

        console.log('Creating Instructors...');
        const instructorsData = [
            {
                name: 'Anil Kumar',
                email: 'anil.kumar@iitrpr.ac.in',
                department: 'Computer Science and Engineering',
                role: 'instructor'
            },
            {
                name: 'Sunil Sharma',
                email: 'sunil.sharma@iitrpr.ac.in',
                department: 'Electronics and Communication Engineering',
                role: 'instructor'
            }
        ];

        const createdInstructors = [];
        for (const iData of instructorsData) {
            // Check if exists to avoid dupes
            let user = await User.findOne({ email: iData.email });
            if (!user) {
                user = new User({
                    ...iData,
                    password: hashedPassword,
                    isVerified: true, // Bypass verification
                    pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(iData.name)}&background=random`
                });
                await user.save();
                console.log(`Created Instructor: ${iData.name}`);
            } else {
                console.log(`Instructor ${iData.name} already exists.`);
            }
            createdInstructors.push(user);
        }

        console.log('Creating Students...');
        const studentsData = [
            {
                name: 'Rahul Gupta',
                email: 'rahul.gupta@iitrpr.ac.in',
                rollNumber: '2023CSB1001',
                department: 'Computer Science and Engineering',
                degree: 'B.Tech',
                yearOfEntry: '2023',
                role: 'student'
            },
            {
                name: 'Priya Singh',
                email: 'priya.singh@iitrpr.ac.in',
                rollNumber: '2023EEB1002',
                department: 'Electronics and Communication Engineering',
                degree: 'B.Tech',
                yearOfEntry: '2023',
                role: 'student'
            }
        ];

        for (const sData of studentsData) {
            let user = await User.findOne({ email: sData.email });
            if (!user) {
                user = new User({
                    ...sData,
                    password: hashedPassword,
                    isVerified: true, // Bypass verification
                    pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(sData.name)}&background=random`
                });
                await user.save();
                console.log(`Created Student: ${sData.name}`);
            } else {
                console.log(`Student ${sData.name} already exists.`);
            }
        }

        console.log('Floated Courses...');
        // Anil (Index 0) floats CSE course
        // Sunil (Index 1) floats ECE course
        const coursesData = [
            {
                code: 'CS301',
                title: 'Database Management Systems',
                department: 'Computer Science and Engineering',
                instructor: createdInstructors[0]._id,
                credits: { lecture: 3, tutorial: 1, practical: 2, total: 4 },
                semester: 'Monsoon',
                year: '2024',
                status: 'Approved', // Floated
                section: 'A',
                slot: 'C1'
            },
            {
                code: 'EC201',
                title: 'Digital Logic Design',
                department: 'Electronics and Communication Engineering',
                instructor: createdInstructors[1]._id,
                credits: { lecture: 3, tutorial: 1, practical: 0, total: 4 },
                semester: 'Monsoon',
                year: '2024',
                status: 'Approved', // Floated
                section: 'A',
                slot: 'A2'
            }
        ];

        for (const cData of coursesData) {
            let course = await Course.findOne({ code: cData.code, semester: cData.semester, year: cData.year });
            if (!course) {
                course = new Course(cData);
                await course.save();
                console.log(`Floated Course: ${cData.code} - ${cData.title}`);
            } else {
                console.log(`Course ${cData.code} already exists.`);
            }
        }

        console.log('--- SEEDING COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
