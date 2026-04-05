const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  hasVoted: { type: Boolean, default: false },
  votedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }]
});

// Automatically hash password when Admin creates a user
userSchema.pre('save', async function() {
  // If the password isn't being changed, just stop here
  if (!this.isModified('password')) return;

  // Hash the password
  // 'this' refers to the user document being saved
  this.password = await bcrypt.hash(this.password, 10);
  
  // Notice: No next() call here! 
  // Mongoose knows we are done when the async function finishes.
});

module.exports = mongoose.model('User', userSchema);