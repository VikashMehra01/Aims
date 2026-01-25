require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CourseRegistration = require('./models/CourseRegistration');
const Course = require('./models/Course'); // Required for population

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aims_db';

const debugLegacy = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get the CS Faculty Advisor
        const csFA = await User.findOne({ email: 'fa.cs@iitrpr.ac.in' });
        if (!csFA) {
            console.log('❌ Critical: CS FA not found!');
            return;
        }
        console.log(`\n1. Found CS FA: ${csFA.name}`);
        console.log(`   Department: '${csFA.department}'`);
        console.log(`   Department Type: ${typeof csFA.department}`);
        console.log(`   Department Length: ${csFA.department.length}`);

        // 2. Get Pending Registrations
        const pending = await CourseRegistration.find({ status: 'Pending_FA' })
            .populate('student', 'name department rollNumber')
            .populate('course', 'code title');

        console.log(`\n2. Found ${pending.length} Pending_FA registrations`);

        // 3. Test Filtering Logic
        console.log('\n3. Testing Filtering Logic for CS FA:');

        let matchCount = 0;
        pending.forEach((reg, i) => {
            const student = reg.student;
            console.log(`\n   --- Registration ${i + 1} ---`);
            if (!student) {
                console.log('   ❌ Student is null/undefined');
                return;
            }

            console.log(`   Student: ${student.name}`);
            console.log(`   Department: '${student.department}'`);

            // Exact strict equality check
            const isMatch = student.department === csFA.department;
            console.log(`   Is Exact Match? ${isMatch}`);

            if (!isMatch) {
                // Debug mismatch
                console.log(`   Mismatch Details:`);
                console.log(`     FA Dept:      '${csFA.department}'`);
                console.log(`     Student Dept: '${student.department}'`);
                console.log(`     Char Codes (FA):      ${getCharCodes(csFA.department)}`);
                console.log(`     Char Codes (Student): ${getCharCodes(student.department)}`);

                // Try trimmed match
                if (student.department.trim() === csFA.department.trim()) {
                    console.log('   ⚠️ Matches if trimmed! Whitespace issue detected.');
                }
            } else {
                matchCount++;
            }
        });

        console.log(`\n4. Summary: CS FA would receive ${matchCount} out of ${pending.length} requests.`);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

function getCharCodes(str) {
    if (!str) return 'null';
    return Array.from(str).map(c => c.charCodeAt(0)).join(',');
}

debugLegacy();
