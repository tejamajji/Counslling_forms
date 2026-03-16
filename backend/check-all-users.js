require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAll() {
  try {
    // Connect to MongoDB
    const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/counselling_forms';
    await mongoose.connect(mongoURL);
    console.log('Connected to MongoDB');

    // Check all users
    const allUsers = await User.find({});
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    // Group by role
    const byRole = {};
    allUsers.forEach(u => {
      if (!byRole[u.role]) byRole[u.role] = [];
      byRole[u.role].push({
        username: u.username,
        email: u.email,
        isDeleted: u.isDeleted,
        assignedMentor: u.assignedMentor ? 'Yes' : 'No'
      });
    });

    console.log('\nUsers by role:');
    Object.entries(byRole).forEach(([role, users]) => {
      console.log(`\n${role}: ${users.length}`);
      users.forEach(u => {
        console.log(`  - ${u.username} (${u.email}) [deleted: ${u.isDeleted}, mentor: ${u.assignedMentor}]`);
      });
    });

    // Count deleted vs active
    const deleted = await User.countDocuments({ isDeleted: true });
    const active = await User.countDocuments({ isDeleted: { $ne: true } });
    console.log(`\n\nSummary:`);
    console.log(`Active users: ${active}`);
    console.log(`Deleted users: ${deleted}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAll();
