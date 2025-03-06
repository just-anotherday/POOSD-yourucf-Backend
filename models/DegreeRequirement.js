const mongoose = require('mongoose');

// Tracks the overall degree requirements including GPA, Residency, and Probation rules.
const degreeRequirementsSchema = new mongoose.Schema({
  program: { type: String, required: true },
  foundationExamRequired: { type: Boolean, default: true },
  residencyRequirement: {
    totalHours: { type: Number, required: true, default: 24 },
    advancedHours: { type: Number, required: true, default: 18 }
  },
  minimumGPA: { type: Number, required: true, default: 2.5 },
  passingGrade: { type: String, required: true, default: 'C' },
  probationRules: {
    maxAttempts: { type: Number, required: true, default: 3 },
    maxUnsuccessfulAttempts: { type: Number, required: true, default: 7 },
    exclusionThreshold: { type: Number, required: true, default: 10 }
  },
  requiredCourses: [{ type: String, ref: 'Course' }], // Core Required Courses
  restrictedElectives: {
    advancedCS: [{ type: String, ref: 'Course' }],  // 4000-5000 level CS
    mathStats: [{ type: String, ref: 'Course' }],   // Advanced Math/Statistics
    capstone: [{ type: String, ref: 'Course' }]     // Senior Design I & II
  }
});

module.exports = mongoose.model('DegreeRequirement', degreeRequirementsSchema);
