const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB HARD LIMIT
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, webp) are allowed!"));
  }
});

// --- ROUTES ---

// 1. Add Candidate with Image Upload
router.post('/add-candidate', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, category } = req.body;
    
    // req.file contains the info about the uploaded photo
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';

    const newCandidate = new Candidate({
      name,
      category,
      imageUrl: imagePath // Saving the local path to DB
    });

    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to add candidate" });
  }
});

// 2. Get Stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const votedCount = await User.countDocuments({ role: 'user', hasVoted: true });
    res.json({ totalUsers, votedCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// 3. Get All Candidates
router.get('/candidates', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ category: 1, voteCount: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Error fetching candidates" });
  }
});

// 4. Get All Students
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// 5. Combined Modify Student
router.put('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ message: "Username taken" });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    if (password) user.password = password;

    await user.save();
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// 6. Delete Candidate
router.delete('/candidate/:id', protect, adminOnly, async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate removed" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// 7. Delete Student
router.delete('/user/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;