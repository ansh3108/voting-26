const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find user by username
    const user = await User.findOne({ username }).populate('votedFor');
    res.json({
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
    hasVoted: user.hasVoted,
    votedFor: user.votedFor // This now contains full candidate objects
  }
});
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Check password (Compare plain text with the hash in DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create a JWT Token
    // We hide the user's ID and role inside this token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // 4. Send back the token and user info (excluding password!)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        hasVoted: user.hasVoted
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

module.exports = router;