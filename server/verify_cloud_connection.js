require('dotenv').config();
const mongoose = require('mongoose');

const seedCourse = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Connected to MongoDB ---');

        const Course = require('./models/Course');

        const newCourse = new Course({
            code: 'CS999',
            title: 'Test Course for Atlas Verification',
            description: 'If you see this on Atlas, your local environment is connected to the Cloud.',
            credits: {
                lecture: 3,
                total: 4
            },
            department: 'Computer Science and Engineering',
            instructor: new mongoose.Types.ObjectId(), // Random dummy ID
            year: "2024",
            semester: "Monsoon",
            isFloated: true
        });

        await newCourse.save();
        console.log('SUCCESS: Course "CS999 - Test Course for Atlas Verification" added!');
        
        console.log('Go strict check your MongoDB Atlas "aims" database -> "courses" collection.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

seedCourse();
