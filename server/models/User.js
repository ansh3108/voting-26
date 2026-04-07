const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Plain text
  role: { type: String, default: 'user' },
  hasVoted: { type: Boolean, default: false },
  votedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }]
});

// Ensure NO .pre('save') hooks exist below this line
module.exports = mongoose.model('User', userSchema);