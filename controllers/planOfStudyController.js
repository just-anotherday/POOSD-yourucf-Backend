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
        console.log("✅ Received request at /api/plans/available/:userId with userId:", req.params.userId);

        const userId = req.params.userId;
        const planOfStudy = await PlanOfStudy.findOne({ studentId: userId });

        console.log("🔍 Retrieved Plan of Study:", planOfStudy);

        if (!planOfStudy) {
            console.log("❌ No Plan of Study found for user:", userId);
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Extract course IDs already in the Plan of Study
        const userCourseIds = new Set();
        planOfStudy.semesters.forEach(semester => {
            semester.courses.forEach(course => {
                console.log("🔍 Found course in Plan of Study:", course);
                if (course.courseId) {
                    userCourseIds.add(course.courseId.toString());
                }
            });
        });

        console.log("🔍 Excluded course IDs (already in Plan of Study):", Array.from(userCourseIds));

        // Fetch courses NOT in user's Plan of Study
        const availableCourses = await Course.find({ courseCode: { $nin: Array.from(userCourseIds) } });

        console.log("✅ Available Courses Retrieved:", availableCourses.length);
        res.json(availableCourses);
    } catch (error) {
        console.error("❌ Error fetching available courses:", error);
        res.status(500).json({ error: "Error fetching available courses", details: error.message });
    }
};




const createPlanOfStudy = async (req, res) => {
    try {
        const { studentId, semesters, totalCredits } = req.body;

        if (!studentId || !semesters || !totalCredits) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newPlan = new PlanOfStudy({
            studentId,
            semesters,
            totalCredits
        });

        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: "Error creating Plan of Study" });
    }
};

module.exports = { addCourseToPlan, getUserPlanOfStudy, getAvailableCourses, createPlanOfStudy };

