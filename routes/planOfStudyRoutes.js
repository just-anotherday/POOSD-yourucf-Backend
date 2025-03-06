const express = require('express');
const router = express.Router();
const PlanOfStudy = require('../models/PlanOfStudy'); 
const { addCourseToPlan } = require('../controllers/planOfStudyController');

// Create a new plan of study
router.post('/', async (req, res) => {
    try {
        const plan = new PlanOfStudy(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a course to an existing plan of study (Validates Prerequisites)
router.post('/add-course', addCourseToPlan);

// Get all plans of study
router.get('/', async (req, res) => {
    try {
        const plans = await PlanOfStudy.find();
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific plan of study by ID
router.get('/:id', async (req, res) => {
    try {
        const plan = await PlanOfStudy.findById(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan of study not found' });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Invalid Plan of Study ID' });
    }
});

// Update a plan of study by ID
router.put('/:id', async (req, res) => {
    try {
        const plan = await PlanOfStudy.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!plan) return res.status(404).json({ error: 'Plan of study not found' });
        res.json(plan);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a plan of study by ID
router.delete('/:id', async (req, res) => {
    try {
        const plan = await PlanOfStudy.findByIdAndDelete(req.params.id);
        if (!plan) return res.status(404).json({ error: 'Plan of study not found' });
        res.json({ message: 'Plan of study deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
