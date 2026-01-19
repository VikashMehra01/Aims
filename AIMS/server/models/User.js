const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Optional for Google Auth users
  pfp: { type: String },
  department: { type: String },
  degree: { type: String },
  yearOfEntry: { type: String },
  googleId: { type: String }, // For Google Auth
  role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
