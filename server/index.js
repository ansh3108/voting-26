const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const adminRoutes = require('./routes/admin'); 

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

// Routes
app.use('/api/admin', adminRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vote', require('./routes/vote'));

// Test Route
app.get('/', (req, res) => {
  res.send("Server is up and running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));