const mongoose = require('mongoose');

// Stores all course-related details including prerequisites and credit hours.
const coursesSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  description: { type: String },
  creditHours: { type: Number, required: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  semestersOffered: [{ type: String, enum: ['Fall', 'Spring', 'Summer'] }],
});

module.exports = mongoose.model('Course', coursesSchema);
