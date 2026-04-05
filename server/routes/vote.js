const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Candidate = require('../models/Candidate');

// Route: POST /api/vote/submit
router.post('/submit', async (req, res) => {
  try {
    const { userId, selectedCandidateIds } = req.body;

    // 1. Double-check if the user has already voted in the DB
    const user = await User.findById(userId);
    if (user.hasVoted) {
      return res.status(403).json({ message: "You have already cast your vote!" });
    }

    // 2. Increment vote counts for all selected candidates
    await Candidate.updateMany(
      { _id: { $in: selectedCandidateIds } },
      { $inc: { voteCount: 1 } }
    );

    // 3. Mark the user as having voted and save their choices
    user.hasVoted = true;
    user.votedFor = selectedCandidateIds;
    await user.save();

    res.json({ message: "Vote submitted successfully!", hasVoted: true });
  } catch (error) {
    res.status(500).json({ message: "Error submitting vote", error: error.message });
  }
});

module.exports = router;