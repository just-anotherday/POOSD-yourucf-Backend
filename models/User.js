const mongoose = require('mongoose');
const PlanOfStudy = require('./PlanOfStudy');
const FoundationExam = require('./FoundationExam');
const Course = require('./Course');

const usersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Admin', 'Advisor'], required: true },
  program: { type: String, required: true },
  degreeRequirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeRequirement', required: true },
  gpa: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'On Probation', 'Excluded'], default: 'Active' },
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  foundationExamPassed: { type: Boolean, default: false },
  probationStatus: {
    attempts: { type: Number, default: 0 },
    unsuccessfulAttempts: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  exclusions: [{
    dateExcluded: { type: Date },
    reason: { type: String, default: "Academic Performance" }
  }],
  readmissionStatus: {
    eligibleForReadmission: { type: Boolean, default: false },
    lastExclusionDate: { type: Date, default: null }
  }
});

// Middleware: Auto-track Probation & Exclusion
usersSchema.pre('save', async function (next) {
    const user = this;
    const failedAttempts = user.probationStatus.unsuccessfulAttempts;

    // 🚨 Rule: If a student fails the same course twice → Probation
    const courseFailures = {};
    for (const courseId of user.completedCourses) {
        courseFailures[courseId] = (courseFailures[courseId] || 0) + 1;
        if (courseFailures[courseId] >= 2) {
            user.status = "On Probation";
        }
        if (courseFailures[courseId] >= 3) {
            user.status = "Excluded";
            user.exclusions.push({ dateExcluded: new Date() });
            user.readmissionStatus.lastExclusionDate = new Date();
            user.readmissionStatus.eligibleForReadmission = false;
        }
    }

    // 🚨 Rule: If a student has **7 total failed courses** → Probation
    if (failedAttempts >= 7 && user.status !== "On Probation") {
        user.status = "On Probation";
    }

    // 🚨 Rule: If a student has **10 total failed courses** → Excluded
    if (failedAttempts >= 10) {
        user.status = "Excluded";
        user.exclusions.push({ dateExcluded: new Date() });
        user.readmissionStatus.lastExclusionDate = new Date();
        user.readmissionStatus.eligibleForReadmission = false;
    }

    next();
});

// Middleware: Readmission Check (Students can reapply after 1 year)
usersSchema.methods.checkReadmissionEligibility = function () {
    if (!this.readmissionStatus.lastExclusionDate) return false;

    const oneYearPassed = new Date() - this.readmissionStatus.lastExclusionDate >= 365 * 24 * 60 * 60 * 1000;
    if (oneYearPassed) {
        this.readmissionStatus.eligibleForReadmission = true;
    }
    return this.readmissionStatus.eligibleForReadmission;
};

// Middleware: Reset Probation After Readmission
usersSchema.methods.grantReadmission = function () {
    if (this.checkReadmissionEligibility()) {
        this.status = "Active";
        this.probationStatus.attempts = 0;
        this.probationStatus.unsuccessfulAttempts = 0;
        this.readmissionStatus.eligibleForReadmission = false;
        this.readmissionStatus.lastExclusionDate = null;
    } else {
        throw new Error("Student is not eligible for readmission yet.");
    }
};

// Middleware: Cleanup Related Records Before Deleting User
usersSchema.pre('remove', async function (next) {
    const userId = this._id;

    try {
        // Delete study plans related to this user
        await PlanOfStudy.deleteMany({ studentId: userId });

        // Remove user from foundation exams
        await FoundationExam.updateMany(
            { "studentsAttempted.studentId": userId },
            { $pull: { studentsAttempted: { studentId: userId } } }
        );

        // Remove completed courses reference 
        await Course.updateMany(
            { _id: { $in: this.completedCourses } },
            { $pull: { completedCourses: userId } }
        );

        console.log(`Deleted related data for user ${userId}`);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', usersSchema);
