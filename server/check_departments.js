require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CourseRegistration = require('./models/CourseRegistration');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const checkDepartments = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB\n');

        console.log('=== Checking Students Departments ===');
        const students = await User.find({ role: 'student' });
        students.forEach(s => {
            console.log(`${s.name}: ${s.department || 'NO DEPARTMENT SET'}`);
        });

        console.log('\n=== Checking FAs Departments ===');
        const fas = await User.find({ role: 'faculty_advisor' });
        fas.forEach(fa => {
            console.log(`${fa.name}: ${fa.department || 'NO DEPARTMENT SET'}`);
        });

        console.log('\n=== Checking Pending_FA Registrations ===');
        const pending = await CourseRegistration.find({ status: 'Pending_FA' })
            .populate('student', 'name department')
            .populate('course', 'code title');

        console.log(`Total Pending_FA registrations: ${pending.length}\n`);
        pending.forEach((p, index) => {
            console.log(`${index + 1}. Student: ${p.student?.name || 'Unknown'}`);
            console.log(`   Department: ${p.student?.department || 'NO DEPARTMENT'}`);
            console.log(`   Course: ${p.course?.code || 'Unknown'} - ${p.course?.title || ''}`);
            console.log('');
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDepartments();
