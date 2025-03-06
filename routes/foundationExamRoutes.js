const express = require('express');
const router = express.Router();
const FoundationExam = require('../models/FoundationExam');

// Create a new Foundation Exam
router.post('/', async (req, res) => {
    try {
        const exam = new FoundationExam(req.body);
        await exam.save();
        res.status(201).json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all Foundation Exams
router.get('/', async (req, res) => {
    try {
        const exams = await FoundationExam.find().populate('studentsAttempted.studentId', 'username role');
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a Foundation Exam by ID
router.get('/:id', async (req, res) => {
    try {
        const exam = await FoundationExam.findById(req.params.id).populate('studentsAttempted.studentId', 'username role');
        if (!exam) return res.status(404).json({ error: 'Foundation Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a Foundation Exam by ID
router.put('/:id', async (req, res) => {
    try {
        const exam = await FoundationExam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!exam) return res.status(404).json({ error: 'Foundation Exam not found' });
        res.json(exam);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a Foundation Exam by ID
router.delete('/:id', async (req, res) => {
    try {
        const exam = await FoundationExam.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ error: 'Foundation Exam not found' });
        res.json({ message: 'Foundation Exam deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
