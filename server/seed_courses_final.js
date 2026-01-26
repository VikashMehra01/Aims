require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

const seedCourses = async () => {
    try {
        console.log('Connecting to DB to seed Courses...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Helper to find instructor ID by email
        const getInstructor = async (email) => {
            const user = await User.findOne({ email });
            return user ? user._id : null;
        };

        const courseList = [
            {
                code: 'CS101',
                title: 'Introduction to Computing',
                email: 'sudarshan@iitrpr.ac.in', // Dr. Sudarshan Iyengar
                credits: { lecture: 3, tutorial: 1, practical: 2, total: 4.5 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'A1'
            },
            {
                code: 'CS201',
                title: 'Data Structures',
                email: 'anilshukla@iitrpr.ac.in', // Dr. Anil Shukla
                credits: { lecture: 3, tutorial: 1, practical: 2, total: 4.5 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'B1'
            },
            {
                code: 'CS302',
                title: 'Computer Architecture',
                email: 'neeraj@iitrpr.ac.in', // Dr. Neeraj Goel
                credits: { lecture: 3, tutorial: 1, practical: 0, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'C1'
            },
            {
                code: 'CS305',
                title: 'Operating Systems',
                email: 'nitin@iitrpr.ac.in', // Dr. Nitin Auluck
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'D1'
            },
            {
                code: 'CS306',
                title: 'Theory of Computation',
                email: 'apurva@iitrpr.ac.in', // Dr. Apurva Mudgal
                credits: { lecture: 3, tutorial: 1, practical: 0, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'E1'
            },
            {
                code: 'CS501',
                title: 'Machine Learning',
                email: 'mukesh@iitrpr.ac.in', // Dr. Mukesh Saini
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'F1'
            },
            {
                code: 'CS503',
                title: 'Advanced Algorithms',
                email: 'jagpreet@iitrpr.ac.in', // Dr. Jagpreet Singh
                credits: { lecture: 3, tutorial: 1, practical: 0, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'G1'
            },
            {
                code: 'CS509',
                title: 'Network Security',
                email: 'basant.subba@iitrpr.ac.in', // Dr. Basant Subba
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'A2'
            },
            {
                code: 'CS601',
                title: 'Game Theory',
                email: 'swapnil@iitrpr.ac.in', // Dr. Swapnil Dhamal
                credits: { lecture: 3, tutorial: 0, practical: 0, total: 3 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'B2'
            },
            {
                code: 'CS602',
                title: 'Distributed Systems',
                email: 'sodhi@iitrpr.ac.in', // Dr. Balwinder Sodhi
                credits: { lecture: 3, tutorial: 0, practical: 2, total: 4 },
                semester: 'Monsoon', year: '2024',
                section: 'A', slot: 'C2'
            },
        ];

        console.log(`Floated ${courseList.length} courses...`);

        for (const c of courseList) {
            const instructorId = await getInstructor(c.email);
            if (!instructorId) {
                console.log(`WARNING: Instructor ${c.email} not found. Skipping ${c.code}.`);
                continue;
            }

            // Check duplicate
            const exists = await Course.findOne({ code: c.code, semester: c.semester, year: c.year });
            if (!exists) {
                const newCourse = new Course({
                    code: c.code,
                    title: c.title,
                    department: 'Computer Science and Engineering',
                    instructor: instructorId,
                    credits: c.credits,
                    semester: c.semester,
                    year: c.year,
                    status: 'Approved',
                    section: c.section,
                    slot: c.slot,
                    isFloated: true
                });
                await newCourse.save();
                console.log(`Floated: ${c.code} - ${c.title} (by ${c.email})`);
            } else {
                console.log(`Skipped (Already exists): ${c.code}`);
            }
        }

        console.log('--- COURSE SEEDING COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding courses:', err);
        process.exit(1);
    }
};

seedCourses();
