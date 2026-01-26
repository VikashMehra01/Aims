require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedStudents = async () => {
    try {
        console.log('Connecting to DB to seed Students...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('1234', salt);

        const students = [
            { name: "Aarav Sharma", email: "2023csb1003@iitrpr.ac.in", rollNumber: "2023CSB1003" },
            { name: "Vivaan Patel", email: "2023csb1004@iitrpr.ac.in", rollNumber: "2023CSB1004" },
            { name: "Aditya Verma", email: "2023csb1005@iitrpr.ac.in", rollNumber: "2023CSB1005" },
            { name: "Vihaan Singh", email: "2023csb1006@iitrpr.ac.in", rollNumber: "2023CSB1006" },
            { name: "Arjun Kumar", email: "2023csb1007@iitrpr.ac.in", rollNumber: "2023CSB1007" },
            { name: "Sai Gupta", email: "2023csb1008@iitrpr.ac.in", rollNumber: "2023CSB1008" },
            { name: "Reyansh Malhotra", email: "2023csb1009@iitrpr.ac.in", rollNumber: "2023CSB1009" },
            { name: "Ayaan Bhat", email: "2023csb1010@iitrpr.ac.in", rollNumber: "2023CSB1010" },
            { name: "Krishna Joshi", email: "2023csb1011@iitrpr.ac.in", rollNumber: "2023CSB1011" },
            { name: "Ishaan Mehta", email: "2023csb1012@iitrpr.ac.in", rollNumber: "2023CSB1012" },
            
            // Some seniors
            { name: "Rohan Das", email: "2022csb1040@iitrpr.ac.in", rollNumber: "2022CSB1040", yearOfEntry: '2022' },
            { name: "Ananya Roy", email: "2021csb1022@iitrpr.ac.in", rollNumber: "2021CSB1022", yearOfEntry: '2021' },
            
            // PhD Student
            { name: "Vikram Sethi", email: "2020phd1001@iitrpr.ac.in", rollNumber: "2020PHD1001", degree: "PhD", yearOfEntry: '2020' }
        ];

        console.log(`Seeding ${students.length} students...`);

        for (const s of students) {
            const exists = await User.findOne({ email: s.email });
            if (!exists) {
                const newUser = new User({
                    name: s.name,
                    email: s.email,
                    rollNumber: s.rollNumber,
                    password: passwordHash,
                    department: 'Computer Science and Engineering',
                    degree: s.degree || 'B.Tech',
                    yearOfEntry: s.yearOfEntry || '2023',
                    role: 'student',
                    isVerified: true,
                    pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`
                });
                await newUser.save();
                console.log(`Created Student: ${s.name} (${s.rollNumber})`);
            } else {
                console.log(`Student ${s.name} already exists.`);
            }
        }

        console.log('--- STUDENT SEEDING COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding students:', err);
        process.exit(1);
    }
};

seedStudents();
