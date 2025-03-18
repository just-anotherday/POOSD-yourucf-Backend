const express = require('express');
const router = express.Router();
const PlanOfStudy = require('../models/PlanOfStudy'); 
const { getUserPlanOfStudy, getAvailableCourses, addCourseToPlan } = require('../controllers/planOfStudyController');

// Route to fetch user's Plan of Study
router.get("/user/:userId", getUserPlanOfStudy);

// Route to fetch available courses (excluding those in user's Plan of Study)
router.get("/available/:userId", getAvailableCourses);

// Add a course to an existing plan of study (Validates Prerequisites)
router.post('/add-course', addCourseToPlan);

// Create a new Plan of Study: This enables the creation of a plan of study using a POST request
router.post('/', async (req, res) => {
    try {
        const { studentId, semesters, totalCredits } = req.body;

        const plan = new PlanOfStudy({
            studentId,
            semesters,
            totalCredits
        });

        await plan.save();
        res.status(201).json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
