const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Check this path!
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    // This catch block prevents the 500 crash and gives us a hint
    console.error("GET Categories Error:", error);
    res.status(500).json({ message: "Server failed to fetch categories", error: error.message });
  }
});

// POST new category
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, maxSelections } = req.body;
    const category = new Category({ name, maxSelections });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("POST Category Error:", error);
    res.status(400).json({ message: "Could not create category. It might already exist." });
  }
});

module.exports = router;