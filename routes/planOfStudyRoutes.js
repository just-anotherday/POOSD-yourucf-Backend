const express = require('express');
const router = express.Router();
const PlanOfStudy = require('../models/PlanOfStudy'); 
const { addCourseToPlan, getUserPlanOfStudy, getAvailableCourses, createPlanOfStudy, addSemester, deleteSemester, searchSemester } = require('../controllers/planOfStudyController');

console.log("✅ planOfStudyRoutes.js Loaded");

// Route to fetch user's Plan of Study
router.get("/user/:userId", getUserPlanOfStudy);

// Route to fetch available courses (excluding those in user's Plan of Study)
router.get("/available/:userId", getAvailableCourses);

// Add a course to an existing plan of study (Validates Prerequisites)
router.post('/add-course', addCourseToPlan);

// Create a new Plan of Study: This enables the creation of a plan of study using a POST request
router.post("/create", createPlanOfStudy);

// Add a semester to a plan of study
router.post("/addSemester", addSemester);

// Remove a semester from a plan of study
router.delete('/deleteSemester/:semesterId/user/:userId', deleteSemester);

// Search for a semester with matching name, year, or both depending on mode
router.post('/searchSemester', searchSemester);

module.exports = router;
