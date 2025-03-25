const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.get('/verify-email', async (req, res) => {
  console.log('Verification endpoint hit')
  const token = req.query.token;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Verification token is missing or invalid.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const user = await User.findByIdAndUpdate(userId, { isValidated: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ message: 'Email successfully verified. You can now log in.' });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({ message: 'Error verifying email: Invalid or expired verification token.' });
  }
});

module.exports = router;
