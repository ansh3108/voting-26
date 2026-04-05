const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');

// --- STUDENT/USER MANAGEMENT ---

/**
 * @route   POST /api/admin/add-user
 * @desc    Manually register a student (Admin only logic)
 */
router.post('/add-user', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username (Roll No) already exists" });
    }

    const newUser = new User({
      name,
      username,
      password, // Will be auto-hashed by User model pre-save hook
      role: role || 'user'
    });

    await newUser.save();
    res.status(201).json({ 
      message: "User created successfully!", 
      user: { name, username, role: newUser.role } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while creating user", error: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get list of all students (voters)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/user/:id
 * @desc    Delete a student from the system
 */
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
});


// --- CANDIDATE MANAGEMENT ---

/**
 * @route   POST /api/admin/add-candidate
 * @desc    Add a candidate to a specific category
 */
router.post('/add-candidate', async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;
    const newCandidate = new Candidate({ name, category, imageUrl });
    await newCandidate.save();
    res.status(201).json({ message: "Candidate added!", candidate: newCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error adding candidate", error: error.message });
  }
});

/**
 * @route   GET /api/admin/candidates
 * @desc    Get all candidates for all categories
 */
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ category: 1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error: error.message });
  }
});

/**
 * @route   DELETE /api/admin/candidate/:id
 * @desc    Remove a candidate
 */
router.delete('/candidate/:id', async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate", error: error.message });
  }
});


// --- DASHBOARD ANALYTICS ---

/**
 * @route   GET /api/admin/stats
 * @desc    Get real-time election progress for the dashboard cards
 */
router.get('/stats', async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'user' });
    const votedCount = await User.countDocuments({ role: 'user', hasVoted: true });
    
    // Fetch candidates sorted by most votes to show leaders
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    res.json({
      totalVoters,
      votedCount,
      candidates
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching live stats", error: error.message });
  }
});

module.exports = router;