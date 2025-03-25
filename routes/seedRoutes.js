// routes/seedRoutes.js
const express = require('express');
const router = express.Router();

// Load Models
const Course = require('../models/Course');

// Load Data
const coursesData = require('../data/coursesData');

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
module.exports = router;
