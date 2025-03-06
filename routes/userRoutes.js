const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteUser, readmitUser } = require('../controllers/userController');
const User = require('../models/User');

// =======================
// Register & Login Routes
// =======================

// Register User
router.post('/register', registerUser);

// Login User
router.post('/login', loginUser);

// =======================
// CRUD Operations
// =======================

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Invalid User ID' });
    }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Readmit User
router.post('/:id/readmit', readmitUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

module.exports = router;
