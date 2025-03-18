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

module.exports = router;
