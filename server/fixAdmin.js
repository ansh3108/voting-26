// USE THIS TO RESET YOUR ADMIN PASSWORD
// RUN cd server -> node fixAdmin.js


const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
  try {
    // 1. Connect to your database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 2. Find your admin account
    // CHANGE 'admin' to whatever your actual admin username is!
    const adminUsername = 'admin'; 
    const newPlainTextPassword = 'adminpassword123'; // Set your new plain text password here

    const admin = await User.findOne({ username: adminUsername });

    if (!admin) {
      console.log("Admin user not found. Check the username in this script.");
      process.exit();
    }

    // 3. Manually update to plain text
    admin.password = newPlainTextPassword;
    await admin.save();

    console.log(`✅ SUCCESS: Admin '${adminUsername}' password is now: ${newPlainTextPassword}`);
    console.log("You can now delete this file and log in.");
    process.exit();

  } catch (err) {
    console.error("❌ Error resetting admin:", err);
    process.exit(1);
  }
};

resetAdmin();