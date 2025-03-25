const express = require('express');
const router = express.Router();
const PlanOfStudy = require('../models/PlanOfStudy'); 
const { addCourseToPlan, getUserPlanOfStudy, getAvailableCourses, createPlanOfStudy } = require('../controllers/planOfStudyController');

console.log("✅ planOfStudyRoutes.js Loaded");

// Route to fetch user's Plan of Study
router.get("/user/:userId", getUserPlanOfStudy);

// Route to fetch available courses (excluding those in user's Plan of Study)
router.get("/available/:userId", getAvailableCourses);

// Add a course to an existing plan of study (Validates Prerequisites)
router.post('/add-course', addCourseToPlan);

// Create a new Plan of Study: This enables the creation of a plan of study using a POST request
router.post("/create", createPlanOfStudy);

module.exports = router;
