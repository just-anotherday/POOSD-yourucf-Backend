const PlanOfStudy = require('../models/PlanOfStudy');
const Course = require("../models/Course");


const addCourseToPlan = async (req, res) => {
    try {
        const { userId, semester, courseId } = req.body;

        // Find the user's Plan of Study
        let plan = await PlanOfStudy.findOne({ studentId: userId });

        if (!plan) {
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Add course to the semester
        const semesterIndex = plan.semesters.findIndex(s => s.semester === semester);
        if (semesterIndex !== -1) {
            plan.semesters[semesterIndex].courses.push({ courseId, status: "Planned" });
        } else {
            plan.semesters.push({
                semester,
                year: new Date().getFullYear(),
                courses: [{ courseId, status: "Planned" }]
            });
        }

        await plan.save();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: "Error adding course to Plan of Study" });
    }
};

// Fetch User's Plan of Study
const getUserPlanOfStudy = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user's Plan of Study
        const planOfStudy = await PlanOfStudy.findOne({ studentId: userId }).populate("semesters.courses.courseId");

        if (!planOfStudy) {
            return res.status(404).json({ message: "Plan of Study not found for user." });
        }

        res.json(planOfStudy);
    } catch (error) {
        res.status(500).json({ error: "Error fetching plan of study" });
    }
};

// Fetch Available Courses (Excluding those already in Plan of Study)
const getAvailableCourses = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get all courses from Plan of Study
        const planOfStudy = await PlanOfStudy.findOne({ studentId: userId });

        const userCourseIds = new Set();
        if (planOfStudy) {
            planOfStudy.semesters.forEach(semester => {
                semester.courses.forEach(course => {
                    userCourseIds.add(course.courseId.toString());
                });
            });
        }

        // Fetch courses NOT in user's Plan of Study
        const availableCourses = await Course.find({ _id: { $nin: Array.from(userCourseIds) } });

        res.json(availableCourses);
    } catch (error) {
        res.status(500).json({ error: "Error fetching available courses" });
    }
};

module.exports = {addCourseToPlan, getUserPlanOfStudy, getAvailableCourses };
