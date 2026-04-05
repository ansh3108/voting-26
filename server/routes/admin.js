const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- 1. STUDENT/USER MANAGEMENT ---

/**
 * @route   POST /api/admin/add-user
 * @desc    Register a new student. Protected: Admins only.
 */
router.post('/add-user', protect, adminOnly, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username (Roll No) already exists" });
    }

    const newUser = new User({
      name,
      username,
      password, // Auto-hashed by pre-save hook in User model
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
 * @desc    Get all students. Protected: Admins only.
 */
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

/**
 * @route   DELETE /api/admin/user/:id
 * @desc    Remove a student. Protected: Admins only.
 */
router.delete('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Student removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student" });
  }
});


// --- 2. CANDIDATE MANAGEMENT ---

/**
 * @route   POST /api/admin/add-candidate
 * @desc    Add a candidate to a category. Protected: Admins only.
 */
router.post('/add-candidate', protect, adminOnly, async (req, res) => {
  try {
    const { name, category, imageUrl } = req.body;
    const newCandidate = new Candidate({ name, category, imageUrl });
    await newCandidate.save();
    res.status(201).json({ message: "Candidate added!", candidate: newCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error adding candidate" });
  }
});

/**
 * @route   GET /api/admin/candidates
 * @desc    Get all candidates. Protected: Admins only.
 */
router.get('/candidates', protect, adminOnly, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ category: 1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates" });
  }
});

/**
 * @route   DELETE /api/admin/candidate/:id
 * @desc    Remove a candidate. Protected: Admins only.
 */
router.delete('/candidate/:id', protect, adminOnly, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate" });
  }
});


// --- 3. DASHBOARD ANALYTICS ---

/**
 * @route   GET /api/admin/stats
 * @desc    Get real-time election progress. Protected: Admins only.
 */
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'user' });
    const votedCount = await User.countDocuments({ role: 'user', hasVoted: true });
    
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    res.json({
      totalVoters,
      votedCount,
      candidates
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});

module.exports = router;