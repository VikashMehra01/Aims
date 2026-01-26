const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseInstructor: { type: String }, // Keep for backward compatibility
    feedbackType: { type: String, enum: ['Mid-sem', 'End-sem', 'Mid-Semester'], required: true },
    content: { type: String }, // Text responses or comments
    ratings: { type: Map, of: mongoose.Schema.Types.Mixed }, // Accept both numbers and strings
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

// One submission per student+course+instructor+type (only enforced for docs that have instructorId)
feedbackSchema.index(
    { student: 1, courseId: 1, instructorId: 1, feedbackType: 1 },
    {
        unique: true,
        partialFilterExpression: { instructorId: { $exists: true } }
    }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
