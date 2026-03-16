require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function unassignStudents() {
  try {
    const mongoURL = process.env.MONGO_URI;
    await mongoose.connect(mongoURL);
    console.log('✓ Connected to MongoDB Atlas');

    // Unassign 20 students from the range to create unassigned students for testing
    const startRoll = 322103311001;
    const endRoll = 322103311020; // First 20 students
    const unassignedCount = [];

    for (let roll = startRoll; roll <= endRoll; roll++) {
      const rollNumber = String(roll);
      const result = await User.updateOne(
        { username: rollNumber, role: 'user' },
        { $unset: { assignedMentor: '' } }
      );

      if (result.modifiedCount > 0) {
        unassignedCount.push(rollNumber);
      }
    }

    console.log(`✓ Unassigned ${unassignedCount.length} students for testing:`);
    unassignedCount.forEach(roll => console.log(`  - ${roll}`));

    // Check total unassigned students now
    const totalUnassigned = await User.countDocuments({
      role: 'user',
      isDeleted: { $ne: true },
      $or: [
        { assignedMentor: { $exists: false } },
        { assignedMentor: null }
      ]
    });

    console.log(`\nTotal unassigned students now: ${totalUnassigned}`);

    await mongoose.disconnect();
    console.log('\n✓ Unassignment complete! Refresh the allocation page to see the unassigned students.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

unassignStudents();
