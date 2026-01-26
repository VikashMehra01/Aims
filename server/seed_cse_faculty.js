require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedCSEFaculty = async () => {
    try {
        console.log('Connecting to DB to seed CSE Faculty...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt);

        const facultyList = [
            { name: "Dr. Anil Shukla", email: "anilshukla@iitrpr.ac.in" },
            { name: "Dr. Apurva Mudgal", email: "apurva@iitrpr.ac.in" },
            { name: "Dr. Balwinder Sodhi", email: "sodhi@iitrpr.ac.in" },
            { name: "Dr. Basant Subba", email: "basant.subba@iitrpr.ac.in" },
            { name: "Dr. Deepti R. Bathula", email: "bathula@iitrpr.ac.in" },
            { name: "Dr. Geeta", email: "geeta@iitrpr.ac.in" },
            { name: "Dr. Jagpreet Singh", email: "jagpreet@iitrpr.ac.in" },
            { name: "Dr. Loitongbam Gyanendro Singh", email: "gyanendro@iitrpr.ac.in" },
            { name: "Dr. T.V. Kalyan", email: "kalyantv@iitrpr.ac.in" },
            { name: "Dr. Manish Kumar", email: "manishk@iitrpr.ac.in" },
            { name: "Dr. Mudasir Ahmad", email: "mudasir@iitrpr.ac.in" },
            { name: "Dr. Mukesh Saini", email: "mukesh@iitrpr.ac.in" },
            { name: "Dr. Neeraj Goel", email: "neeraj@iitrpr.ac.in" },
            { name: "Dr. Nitin Auluck", email: "nitin@iitrpr.ac.in" },
            { name: "Dr. Puneet Goyal", email: "puneet@iitrpr.ac.in" },
            { name: "Dr. Shashi Shekhar Jha", email: "shashi@iitrpr.ac.in" },
            { name: "Dr. Shweta Jain", email: "shwetajain@iitrpr.ac.in" },
            { name: "Dr. Sudarshan Iyengar", email: "sudarshan@iitrpr.ac.in" },
            { name: "Dr. Sudeepta Mishra", email: "sudeepta@iitrpr.ac.in" },
            { name: "Dr. Sujata Pal", email: "sujata@iitrpr.ac.in" },
            { name: "Dr. Swapnil Dhamal", email: "swapnil@iitrpr.ac.in" }
        ];

        console.log(`Found ${facultyList.length} faculty members to insert.`);

        for (const f of facultyList) {
            const exists = await User.findOne({ email: f.email });
            if (!exists) {
                const newUser = new User({
                    name: f.name,
                    email: f.email,
                    password: hashedPassword,
                    role: 'instructor',
                    department: 'Computer Science and Engineering',
                    isVerified: true,
                    pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=random`
                });
                await newUser.save();
                console.log(`Created: ${f.name} (${f.email})`);
            } else {
                console.log(`Skipped (Already exists): ${f.name}`);
            }
        }

        console.log('--- CSE FACULTY SEEDING COMPLETE ---');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding faculty:', err);
        process.exit(1);
    }
};

seedCSEFaculty();
