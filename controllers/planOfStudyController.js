const PlanOfStudy = require('../models/PlanOfStudy');
const User = require('../models/User');
const Course = require('../models/Course');
const DegreeRequirement = require('../models/DegreeRequirement');

// Add Course to Plan of Study with Prerequisite & Foundation Exam Checking
const addCourseToPlan = async (req, res) => {
    try {
        const { userId, courseId, semester, year } = req.body;

        // Fetch user, course, and degree requirement
        const user = await User.findById(userId).populate('completedCourses');
        const course = await Course.findById(courseId).populate('prerequisites');
        const degreeRequirement = await DegreeRequirement.findById(user.degreeRequirementId);

        if (!user || !course || !degreeRequirement) {
            return res.status(404).json({ error: 'User, course, or degree requirement not found' });
        }

        // Ensure course is part of degree requirement
        if (!degreeRequirement.requiredCourses.includes(courseId) &&
            !degreeRequirement.restrictedElectives.advancedCS.includes(courseId)) {
            return res.status(400).json({ error: 'Course is not in your degree requirement' });
        }

        // Foundation Exam Enforcement: Students must pass `COT 3960` before 4000+ courses
        if (!user.foundationExamPassed && parseInt(course.courseCode.match(/\d+/)[0]) >= 4000) {
            return res.status(400).json({
                error: `Cannot enroll in ${course.courseName} - must pass the Foundation Exam (COT 3960) first.`
            });
        }

        // Check if prerequisites are met (including planned & completed courses)
        const studentPlan = await PlanOfStudy.findOne({ studentId: userId });
        const prerequisitesMet = validatePrerequisites(studentPlan, course, semester, year);

        if (!prerequisitesMet) {
            return res.status(400).json({
                error: 'Prerequisite(s) not met for future enrollment',
                unmetPrerequisites: course.prerequisites.map(p => p.courseCode)
            });
        }

        // Add course to the correct semester/year
        const updatedPlan = await PlanOfStudy.findOneAndUpdate(
            { studentId: userId, "semesters.year": year, "semesters.semester": semester },
            { $push: { "semesters.$.courses": { courseId, status: 'Planned' } } },
            { new: true, upsert: true }
        );

        res.json({ message: 'Course added successfully', updatedPlan });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Function: Validate Prerequisites Before Adding a Course
function validatePrerequisites(studentPlan, newCourse, semester, year) {
    let previousCourses = new Set();

    if (!studentPlan) return false; // No existing plan

    studentPlan.semesters.forEach(s => {
        if (s.year < year || (s.year === year && s.semester < semester)) {
            s.courses.forEach(course => previousCourses.add(course.courseId.toString()));
        } else if (s.year === year && s.semester === semester) {
            s.courses.forEach(course => {
                if (course.status === 'Ongoing') previousCourses.add(course.courseId.toString());
            });
        }
    });

    return newCourse.prerequisites.every(prereq => previousCourses.has(prereq.toString()));
}

module.exports = { addCourseToPlan };
