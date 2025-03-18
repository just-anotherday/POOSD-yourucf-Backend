const User = require('../models/User');
const PlanOfStudy = require('../models/PlanOfStudy');
const bcrypt = require('bcryptjs'); //Uses bcryptjs to hash passwords before storing them in MongoDB.
const jwt = require('jsonwebtoken'); //Generates a JWT token upon successful login.

// Register User
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, username, password, email } = req.body;

        // Ensure all required fields are provided
        if (!firstName || !lastName || !username || !password || !email) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if the user already exists
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ error: 'Username or Email already in use.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (isValid = false by default)
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            password: hashedPassword,
            email,
            isValid: false // User must verify email
        });

        // TODO: Send Verification Email (implement email service)
        res.status(201).json({ message: "User registered. Please verify your email.", userId: newUser._id });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get User by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Invalid User ID' });
    }
};

// Delete User & Clean Up Related Data
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user first
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Delete related records in other collections
        await PlanOfStudy.deleteMany({ studentId: userId }); // Remove user's plan of study

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and related data deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser, getUserById, deleteUser };
