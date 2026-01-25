require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const CourseRegistration = require('./models/CourseRegistration');
const Feedback = require('./models/Feedback');
const HelpRequest = require('./models/HelpRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const inspectDatabase = async () => {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('=== Available Collections ===');
        collections.forEach(col => console.log(`  - ${col.name}`));
        console.log('');

        // Users
        const users = await User.find({});
        console.log(`=== Users (${users.length} total) ===`);
        users.forEach(user => {
            console.log(`  - ${user.name} (${user.email})`);
            console.log(`    Role: ${user.role}`);
            console.log(`    Roll: ${user.rollNumber || 'N/A'}`);
            console.log(`    Verified: ${user.isVerified}`);
            console.log('');
        });

        // Courses
        const courses = await Course.find({}).populate('instructor');
        console.log(`=== Courses (${courses.length} total) ===`);
        courses.forEach(course => {
            console.log(`  - ${course.code}: ${course.title}`);
            console.log(`    Instructor: ${course.instructor?.name || 'Unknown'}`);
            console.log(`    Status: ${course.status}`);
            console.log(`    Credits: ${course.credits.total}`);
            console.log(`    Semester: ${course.semester} ${course.year}`);
            console.log('');
        });

        // Course Registrations
        const registrations = await CourseRegistration.find({})
            .populate('student')
            .populate('course');
        console.log(`=== Course Registrations (${registrations.length} total) ===`);
        registrations.forEach(reg => {
            console.log(`  - Student: ${reg.student?.name || 'Unknown'}`);
            console.log(`    Course: ${reg.course?.code || 'Unknown'} - ${reg.course?.title || ''}`);
            console.log(`    Type: ${reg.type}`);
            console.log(`    Status: ${reg.status}`);
            console.log('');
        });

        // Feedback
        const feedbacks = await Feedback.find({});
        console.log(`=== Feedbacks (${feedbacks.length} total) ===`);
        feedbacks.forEach(fb => {
            console.log(`  - Rating: ${fb.rating}/5`);
            console.log(`    Message: ${fb.message || 'N/A'}`);
            console.log('');
        });

        // Help Requests
        const helpRequests = await HelpRequest.find({})
            .populate('user');
        console.log(`=== Help Requests (${helpRequests.length} total) ===`);
        helpRequests.forEach(hr => {
            console.log(`  - User: ${hr.user?.name || 'Unknown'}`);
            console.log(`    Message: ${hr.message}`);
            console.log(`    Status: ${hr.status || 'N/A'}`);
            console.log('');
        });

        console.log('=== Database Inspection Complete ===');
        process.exit(0);
    } catch (err) {
        console.error('Error connecting to database:', err.message);
        console.log('\nTrying to connect to MongoDB at:', MONGO_URI);
        console.log('Make sure MongoDB is running locally or set MONGO_URI in .env file');
        process.exit(1);
    }
};

inspectDatabase();
