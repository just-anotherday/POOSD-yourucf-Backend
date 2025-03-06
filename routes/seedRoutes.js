// routes/seedRoutes.js
const express = require('express');
const router = express.Router();

// Load Models
const Area = require('../models/Area');
const Course = require('../models/Course');
const DegreeRequirement = require('../models/DegreeRequirement');
const FoundationExam = require('../models/FoundationExam');

// Load Data
const areasData = require('../data/areasData');
const coursesData = require('../data/coursesData');
const degreeRequirementsData = require('../data/degreeRequirementsData');
const foundationExamData = require('../data/foundationExamData');

// Seed Areas Data
router.get('/seed/areas', async (req, res) => {
    try {
        await Promise.all(areasData.map(async (area) => {
            await Area.findOneAndUpdate(
                { areaName: area.areaName }, // Match by areaName
                area,                       // Update data
                { upsert: true, new: true }  // Insert if not found
            );
        }));
        res.status(200).json({ message: 'Areas data seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed Courses Data
router.get('/seed/courses', async (req, res) => {
    try {
        await Promise.all(coursesData.map(async (course) => {
            await Course.findOneAndUpdate(
                { courseCode: course.courseCode }, 
                course, 
                { upsert: true, new: true }
            );
        }));
        res.status(200).json({ message: 'Courses data seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Seed Degree Requirements Data
router.get('/seed/degreerequirements', async (req, res) => {
    try {
        await Promise.all(degreeRequirementsData.map(async (reqData) => {
            await DegreeRequirement.findOneAndUpdate(
                { program: reqData.program }, 
                reqData, 
                { upsert: true, new: true }
            );
        }));
        res.status(200).json({ message: 'Degree Requirements data seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Seed Foundation Exam Data
router.get('/seed/foundationexams', async (req, res) => {
    try {
        await Promise.all(foundationExamData.map(async (exam) => {
            await FoundationExam.findOneAndUpdate(
                { examCode: exam.examCode }, 
                exam, 
                { upsert: true, new: true }
            );
        }));
        res.status(200).json({ message: 'Foundation Exam data seeded successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
