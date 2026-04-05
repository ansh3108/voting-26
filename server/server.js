// Inside your voting route
app.post('/api/vote', async (req, res) => {
  const { candidateIds, userId } = req.body;
  const user = await User.findById(userId);

  if (user.hasVoted) return res.status(400).json({ msg: "Already voted!" });

  // Increment vote counts for candidates
  await Candidate.updateMany(
    { _id: { $in: candidateIds } },
    { $inc: { voteCount: 1 } }
  );

  // Mark user as voted
  user.hasVoted = true;
  user.votedFor = candidateIds;
  await user.save();

  res.json({ msg: "Vote cast successfully!" });
});