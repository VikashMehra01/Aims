const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    courseInstructor: { type: String, required: true },
    feedbackType: { type: String, enum: ['Mid-sem', 'End-sem'], required: true },
    content: { type: String }, // Optional text feedback
    ratings: { type: Map, of: Number }, // Flexible ratings
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true } // To check if feedback is currently active
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
