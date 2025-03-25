const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserById, deleteUser } = require('../controllers/userController');//Ensure all functions exist
const User = require('../models/User');

// Ensure all functions exist in userController.js
if (!registerUser || !loginUser || !getUserById || !deleteUser) {
    throw new Error("One or more controller functions are missing in userController.js");
}

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

router.get('/:id', getUserById);

// Delete a user by ID
router.delete('/:id', deleteUser);

module.exports = router;
