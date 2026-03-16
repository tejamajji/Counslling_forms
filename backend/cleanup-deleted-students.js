require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanup() {
  try {
    // Connect to MongoDB
    const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/counselling_forms';
    await mongoose.connect(mongoURL);
    console.log('Connected to MongoDB');

    // Find all soft-deleted students
    const deletedStudents = await User.find({ role: 'user', isDeleted: true });
    console.log(`Found ${deletedStudents.length} soft-deleted student records`);

    if (deletedStudents.length > 0) {
      // Permanently delete them
      const result = await User.deleteMany({ role: 'user', isDeleted: true });
      console.log(`✓ Permanently deleted ${result.deletedCount} records`);
    }

    // Show remaining active students
    const activeStudents = await User.find({ role: 'user', isDeleted: { $ne: true } });
    console.log(`\nActive students remaining: ${activeStudents.length}`);
    console.log('Active students:', activeStudents.map(s => s.username));

    await mongoose.disconnect();
    console.log('Cleanup complete!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanup();
