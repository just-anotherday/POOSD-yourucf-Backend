const Course = require('../models/Course');
const User = require('../models/User');
const PlanOfStudy = require('../models/PlanOfStudy');
const DegreeRequirement = require('../models/DegreeRequirement');

// Get All Courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add New Course
const addCourse = async (req, res) => {
    try {
        const { courseCode, courseName, creditHours, prerequisites, area, semestersOffered } = req.body;

        // Create a new course
        const course = await Course.create({ 
            courseCode, 
            courseName, 
            creditHours, 
            prerequisites, 
            area, 
            semestersOffered 
        });

        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Enroll User in a Course (Checking Prerequisites)
const enrollInCourse = async (req, res) => {
    try {
        const { userId, courseId, semester, year } = req.body;

        // Fetch user and course
        const user = await User.findById(userId);
        const course = await Course.findById(courseId).populate('prerequisites'); // Fetch prerequisites
        const degreeRequirement = await DegreeRequirement.findById(user.degreeRequirementId);
        const plan = await PlanOfStudy.findOne({ studentId: userId });

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        if (!degreeRequirement) return res.status(404).json({ error: 'Degree Requirement not found' });
        if (!plan) return res.status(400).json({ error: 'Plan of Study not found' });

        // Check if course is in the user's degree requirement
        if (!degreeRequirement.requiredCourses.includes(courseId)) {
            return res.status(400).json({ error: 'This course is not part of your degree requirements.' });
        }

        // Gather all completed, current, and planned courses
        const completedCourses = new Set(user.completedCourses.map(c => c.toString()));
        const currentAndPlannedCourses = new Map(); // Stores planned courses by semester & year

        // Populate courses from Plan of Study
        for (const sem of plan.semesters) {
            for (const plannedCourse of sem.courses) {
                const key = `${sem.year}-${sem.semester}`; // Unique key for each semester
                if (!currentAndPlannedCourses.has(key)) {
                    currentAndPlannedCourses.set(key, new Set());
                }
                currentAndPlannedCourses.get(key).add(plannedCourse.courseId.toString());
            }
        }

        // Check if all prerequisites are met (completed, current, or in a prior semester)
        const unmetPrerequisites = course.prerequisites.filter(prereq => {
            const prereqId = prereq._id.toString();

            // 1. If prerequisite is already completed, it's satisfied
            if (completedCourses.has(prereqId)) return false;

            // 2. If prerequisite is planned in a semester before the target semester, it's satisfied
            for (const [key, plannedCourses] of currentAndPlannedCourses.entries()) {
                const [plannedYear, plannedSemester] = key.split('-').map(str => isNaN(str) ? str : parseInt(str));

                // Ensure prerequisite is taken **before** the target semester
                if (
                    (plannedYear < year) || 
                    (plannedYear === year && plannedSemester < semester)
                ) {
                    if (plannedCourses.has(prereqId)) return false;
                }
            }

            // 3. If prerequisite isn't met, return true to mark it as unmet
            return true;
        });

        if (unmetPrerequisites.length > 0) {
            return res.status(400).json({
                error: 'Prerequisite(s) not met',
                unmetPrerequisites: unmetPrerequisites.map(course => course.courseCode)
            });
        }

        // Add the course to the user's plan of study
        await PlanOfStudy.findOneAndUpdate(
            { studentId: userId },
            { 
                $push: { 
                    "semesters.$[sem].courses": { courseId, status: 'Planned' }
                }
            },
            { 
                new: true, 
                arrayFilters: [{ "sem.semester": semester, "sem.year": year }],
                upsert: true
            }
        );

        res.json({ message: 'Enrolled successfully', courseId, semester, year });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getCourses, addCourse, enrollInCourse };
