const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find user and POPULATE their voting history
    // The 'await' MUST be inside this 'async' function
    const user = await User.findOne({ username }).populate('votedFor');
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Send back user data (including the populated votedFor array)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        hasVoted: user.hasVoted,
        votedFor: user.votedFor 
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

module.exports = router;