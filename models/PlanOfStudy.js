const mongoose = require('mongoose');
const User = require('./User');
const Course = require('./Course');

// Tracks each student’s plan of study including completed, ongoing, and planned courses.
const planOfStudySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  program: { type: String, required: true },
  degreeRequirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeRequirement', required: true }, 
  semesters: [{
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    courses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
      status: { type: String, enum: ['Planned', 'Ongoing', 'Completed'], default: 'Planned' },
      grade: { type: String, default: null }
    }]
  }],
  totalCredits: { type: Number, default: 0 },
  gpa: { type: Number, default: 0 }
});

// Prevent duplicate courses in any semester (not just within a single semester)
planOfStudySchema.pre('save', async function (next) {
    const seenCourses = new Set();
    for (const semester of this.semesters) {
        for (const course of semester.courses) {
            if (seenCourses.has(course.courseId.toString())) {
                return next(new Error(`Duplicate course detected: ${course.courseId}`));
            }
            seenCourses.add(course.courseId.toString());
        }
    }
    next();
});

// Validate courses against the user's degree requirement
planOfStudySchema.pre('save', async function (next) {
    const plan = this;

    // Fetch degree requirement for the user
    const degreeRequirement = await mongoose.model('DegreeRequirement').findById(plan.degreeRequirementId);
    if (!degreeRequirement) {
        return next(new Error('Degree requirement not found for this user.'));
    }

    // Check if all courses are part of the degree requirement
    const validCourses = new Set(degreeRequirement.requiredCourses.map(course => course.toString()));
    
    for (const semester of plan.semesters) {
        for (const course of semester.courses) {
            if (!validCourses.has(course.courseId.toString())) {
                return next(new Error(`Course ${course.courseId} is not part of the required courses for this program.`));
            }
        }
    }

    next();
});

async function validateFoundationExam(studentId, courseId) {
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student.foundationExamPassed && parseInt(course.courseCode.match(/\d+/)[0]) >= 4000) {
        throw new Error(`Cannot enroll in ${course.courseName} - must pass the Foundation Exam (COT 3960) first.`);
    }
}

planOfStudySchema.pre('save', async function (next) {
    const plan = this;
    
    // Get all completed and ongoing courses for prerequisite validation
    let completedAndOngoingCourses = new Set();
    
    plan.semesters.forEach(semester => {
        semester.courses.forEach(course => {
            if (course.status === "Completed" || course.status === "Ongoing") {
                completedAndOngoingCourses.add(course.courseId.toString());
            }
        });
    });

    for (const semester of plan.semesters) {
        for (const course of semester.courses) {
            const courseDetails = await Course.findById(course.courseId);

            // Check prerequisites for planned courses
            for (const prereq of courseDetails.prerequisites) {
                if (!completedAndOngoingCourses.has(prereq.toString())) {
                    return next(new Error(`Course ${courseDetails.courseCode} cannot be planned until prerequisite ${prereq} is completed.`));
                }
            }

            // Add this course to the completed set for future prerequisite checks
            completedAndOngoingCourses.add(course.courseId.toString());
        }
    }

    next();
});



module.exports = mongoose.model('PlanOfStudy', planOfStudySchema);
