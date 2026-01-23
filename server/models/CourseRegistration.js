const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    type: {
        type: String,
        enum: ['Credit', 'Audit', 'Minor', 'Concentration'],
        default: 'Credit'
    },
    status: {
        type: String,
        enum: ['Pending_Instructor', 'Pending_FA', 'Approved', 'Rejected'],
        default: 'Pending_Instructor'
    },
    approvedByInstructor: { type: Boolean, default: false },
    approvedByFA: { type: Boolean, default: false },
    grade: {
        type: String,
        enum: ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F', 'I', 'W', 'S', 'X', 'NP', null],
        default: null
    },
    attendance: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    semester: {
        type: String,
        default: null
    },
    courseCategory: {
        type: String,
        enum: ['SC', 'HC', 'PC', 'GR', 'OR', 'NC', 'NN'],
        default: 'SC'
    }
}, { timestamps: true });

// Prevent duplicate registration for same course
courseRegistrationSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);
