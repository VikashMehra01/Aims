require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const checkCourses = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB\n');

        const courses = await Course.find({}).populate('instructor', 'name email');

        console.log('=== All Courses in Database ===');
        console.log(`Total courses: ${courses.length}\n`);

        if (courses.length === 0) {
            console.log('No courses found in database.');
        } else {
            courses.forEach((c, index) => {
                console.log(`${index + 1}. ${c.title}`);
                console.log(`   Code: ${c.code}`);
                console.log(`   Status: ${c.status}`);
                console.log(`   Instructor: ${c.instructor?.name || 'N/A'} (${c.instructor?.email || 'N/A'})`);
                console.log(`   Department: ${c.department}`);
                console.log(`   Session: ${c.year} - ${c.semester}`);
                console.log('');
            });
        }

        // Check specifically for Proposed courses
        const proposed = courses.filter(c => c.status === 'Proposed');
        console.log(`\n=== Courses with Status 'Proposed' ===`);
        console.log(`Total: ${proposed.length}`);
        proposed.forEach(c => {
            console.log(`  - ${c.title} (${c.code}) by ${c.instructor?.name || 'Unknown'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkCourses();
