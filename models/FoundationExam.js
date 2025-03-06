const mongoose = require('mongoose');

// Tracks the Foundation Exam requirements and student performance.
const foundationExamSchema = new mongoose.Schema({
  examCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  offeredSemesters: [{ type: String, enum: ['Fall', 'Spring', 'Summer'] }],
  studentsAttempted: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attempts: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    datePassed: { type: Date }
  }]
});

module.exports = mongoose.model('FoundationExam', foundationExamSchema);
