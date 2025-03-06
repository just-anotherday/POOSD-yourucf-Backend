const User = require('../models/User');
const PlanOfStudy = require('../models/PlanOfStudy');
const FoundationExam = require('../models/FoundationExam');
const bcrypt = require('bcryptjs'); //Uses bcryptjs to hash passwords before storing them in MongoDB.
const jwt = require('jsonwebtoken'); //Generates a JWT token upon successful login.

// Register User
const registerUser = async (req, res) => {
    try {
        console.log("Incoming Registration Request:", req.body); // Debugging

        const { username, password, role, program, degreeRequirementId } = req.body;

        console.log("Received degreeRequirementId:", degreeRequirementId); // Debugging

        // Ensure degreeRequirementId is received
        if (!degreeRequirementId) {
            return res.status(400).json({ error: "degreeRequirementId is required in the request body." });
        }

        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(degreeRequirementId)) {
            return res.status(400).json({ error: "Invalid degreeRequirementId format. Must be a valid ObjectId." });
        }

        console.log("degreeRequirementId is valid!"); // Debugging
        // Check if Degree Requirement Exists
        const degreeRequirement = await mongoose.model('DegreeRequirement').findById(degreeRequirementId);
        if (!degreeRequirement) {
            return res.status(404).json({ error: "Degree Requirement not found." });
        }

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            role,
            program,
            degreeRequirementId: new mongoose.Types.ObjectId(degreeRequirementId) // ✅ FIXED HERE
        });

        console.log("User successfully created:", user); // Debugging

        res.status(201).json(user);
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

//Add readmission logic when a student applies for readmission
const readmitUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.checkReadmissionEligibility()) {
            user.grantReadmission();
            await user.save();
            return res.json({ message: 'Student successfully readmitted' });
        } else {
            return res.status(400).json({ error: 'Student is not eligible for readmission yet' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        await FoundationExam.updateMany(
            { "studentsAttempted.studentId": userId },
            { $pull: { studentsAttempted: { studentId: userId } } } // Remove user from foundation exam records
        );

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and related data deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser, readmitUser, deleteUser };
