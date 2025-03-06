const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust the path if necessary
const router = express.Router();

// Validate JWT_SECRET environment variable
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in the environment variables.');
    process.exit(1);
}

// Register Route
router.post('/register', async (req, res) => {
    console.log(req.body); // Debugging
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Please enter a password' });
        }

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password, // Store password in plaintext
        });

        await newUser.save();
        const message = `User registered successfully, welcome ${firstName} ${lastName}`;
        res.status(201).json({ message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('User found:', user);

        // Compare plaintext passwords
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        const message = `Login successful, welcome ${user.firstName} ${user.lastName}`;
        res.json({ message, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
    // Password validation function
function validatePassword(password, confirmPassword) {
    const errors = [];

    // Minimum Requirements
    if (password.length < 8) 
        errors.push('Password must be at least 8 characters long');
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    if (!hasUppercase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowercase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasDigit) {
        errors.push('Password must contain at least one digit');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }
    // confirm password
    if (password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    return errors;
}
});

module.exports = router;