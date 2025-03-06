// routes/degreeRequirementRoutes.js
const express = require('express');
const router = express.Router();
const DegreeRequirement = require('../models/DegreeRequirement');

// Create a new Degree Requirement
router.post('/', async (req, res) => {
    try {
        const degreeRequirement = new DegreeRequirement(req.body);
        await degreeRequirement.save();
        res.status(201).json(degreeRequirement);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all Degree Requirements
router.get('/', async (req, res) => {
    try {
        const degreeRequirements = await DegreeRequirement.find();
        res.json(degreeRequirements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a Degree Requirement by ID
router.get('/:id', async (req, res) => {
    try {
        const degreeRequirement = await DegreeRequirement.findById(req.params.id);
        if (!degreeRequirement) return res.status(404).json({ error: 'Degree Requirement not found' });
        res.json(degreeRequirement);
    } catch (err) {
        res.status(500).json({ error: 'Invalid Degree Requirement ID' });
    }
});

// Update a Degree Requirement by ID
router.put('/:id', async (req, res) => {
    try {
        const degreeRequirement = await DegreeRequirement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!degreeRequirement) return res.status(404).json({ error: 'Degree Requirement not found' });
        res.json(degreeRequirement);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a Degree Requirement by ID
router.delete('/:id', async (req, res) => {
    try {
        const degreeRequirement = await DegreeRequirement.findByIdAndDelete(req.params.id);
        if (!degreeRequirement) return res.status(404).json({ error: 'Degree Requirement not found' });
        res.json({ message: 'Degree Requirement deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
