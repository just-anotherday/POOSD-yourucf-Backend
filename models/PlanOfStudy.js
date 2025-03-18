const mongoose = require('mongoose');
const User = require('./User');
const Course = require('./Course');

// Tracks each student’s plan of study including completed, ongoing, and planned courses.
const planOfStudySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesters: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },  // Unique semester ID
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    courses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      status: { type: String, enum: ['Planned', 'Ongoing', 'Completed'], default: 'Planned' },
    }]
  }],
  totalCredits: { type: Number, default: 0 },
});

module.exports = mongoose.model('PlanOfStudy', planOfStudySchema);
