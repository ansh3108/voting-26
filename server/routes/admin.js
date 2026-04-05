const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your User model

// Route: POST /api/admin/add-user
router.post('/add-user', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // 2. Create new user
    // Note: The password will be hashed automatically by the 'pre-save' hook we wrote in models/User.js
    const newUser = new User({
      name,
      username,
      password,
      role: role || 'user' // Defaults to 'user' if not provided
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: { name, username, role } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating user" });
  }
});

module.exports = router;