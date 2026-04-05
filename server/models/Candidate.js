const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Tech Champs"
  imageUrl: { type: String },
  voteCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Candidate', candidateSchema);