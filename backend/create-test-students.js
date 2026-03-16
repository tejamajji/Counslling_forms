require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createTestStudents() {
  try {
    const mongoURL = process.env.MONGO_URI;
    await mongoose.connect(mongoURL);
    console.log('✓ Connected to MongoDB Atlas');

    // Create students from 322103311001 to 322103311058, skipping duplicates
    const startRoll = 322103311001;
    const endRoll = 322103311058;
    const students = [];
    
    for (let roll = startRoll; roll <= endRoll; roll++) {
      const rollNumber = String(roll);
      const email = `${rollNumber}@gvpce.ac.in`;
      
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username: rollNumber }] });
      if (existingUser) {
        console.log(`Skipping ${rollNumber} - already exists`);
        continue;
      }
      
      const password = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);

      students.push({
        username: rollNumber,
        email: email,
        password: hashedPassword,
        role: 'user',
        isDeleted: false,
        hasLoggedIn: false,
        yearOfStudy: 4,
        yearAssignmentMode: 'manual'
      });
    }

    const result = await User.insertMany(students);
    console.log(`✓ Created ${result.length} test students`);
    console.log('Student roll numbers:');
    result.forEach(s => console.log(`  - ${s.username}`));

    await mongoose.disconnect();
    console.log('\n✓ Cleanup and creation complete!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createTestStudents();
