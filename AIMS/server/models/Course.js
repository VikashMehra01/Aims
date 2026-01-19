const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    instructor: { type: String, required: true }, // Could act as reference to User if needed, keeping string for simplicity as per requirements
    slot: { type: String, required: true },
    credits: { type: Number, required: true },
    semester: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
