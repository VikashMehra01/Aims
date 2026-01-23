const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true }, // e.g., CS101
    title: { type: String, required: true },
    department: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    credits: {
        lecture: { type: Number, default: 3 },
        tutorial: { type: Number, default: 0 },
        practical: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },
    semester: { type: String, required: true }, // e.g., "Monsoon 2024"
    year: { type: String, required: true },

    // New Float Fields
    status: { type: String, enum: ['Proposed', 'Approved', 'Rejected'], default: 'Proposed' },
    
    eligibility: [{
        degree: String,
        department: String,
        category: String,
        entryYears: [String] // e.g. ["2023", "2024"]
    }],

    coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Other instructors
    section: { type: String }, // e.g. "A", "B"
    slot: { type: String }, // e.g. "C1", "A2"
    
    // Enrollment Controls
    enrollmentDeadline: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // Default: 7 days from now
    },
    isEnrollmentOpen: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure unique course offering per semester/year/section
courseSchema.index({ code: 1, semester: 1, year: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
