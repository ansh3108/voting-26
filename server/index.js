const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/category');
const voteRoutes = require('./routes/vote');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- THE FIX: ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // This must match your frontend calls
app.use('/api/categories', categoryRoutes);
app.use('/api/vote', voteRoutes);
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));