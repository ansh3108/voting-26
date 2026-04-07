const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  // CHANGE: imageUrl (text input) becomes imagePath (file input)
  imagePath: { 
    type: String, 
    default: '' // We will store the full URL or relative path here
  },
  voteCount: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('Candidate', candidateSchema);