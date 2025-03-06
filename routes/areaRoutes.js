// routes/areaRoutes.js
const express = require('express');
const router = express.Router();
const Area = require('../models/Area');

// Create a new Area
router.post('/', async (req, res) => {
    try {
        const area = new Area(req.body);
        await area.save();
        res.status(201).json(area);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all Areas
router.get('/', async (req, res) => {
    try {
        const areas = await Area.find();
        res.json(areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific Area by ID
router.get('/:id', async (req, res) => {
    try {
        const area = await Area.findById(req.params.id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an Area by ID
router.put('/:id', async (req, res) => {
    try {
        const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.json(area);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an Area by ID
router.delete('/:id', async (req, res) => {
    try {
        const area = await Area.findByIdAndDelete(req.params.id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.json({ message: 'Area deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
