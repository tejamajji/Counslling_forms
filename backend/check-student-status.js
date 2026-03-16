require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkStudentStatus() {
  try {
    const mongoURL = process.env.MONGO_URI;
    await mongoose.connect(mongoURL);
    console.log('✓ Connected to MongoDB Atlas');

    // Check students in the range 322103311001-322103311058
    const startRoll = 322103311001;
    const endRoll = 322103311058;
    const students = [];

    for (let roll = startRoll; roll <= endRoll; roll++) {
      const rollNumber = String(roll);
      const student = await User.findOne({ username: rollNumber, role: 'user' });
      if (student) {
        students.push({
          roll: rollNumber,
          assignedMentor: student.assignedMentor ? 'Yes' : 'No',
          isDeleted: student.isDeleted,
          yearOfStudy: student.yearOfStudy
        });
      }
    }

    console.log(`\nFound ${students.length} students in range 322103311001-322103311058:`);

    const assigned = students.filter(s => s.assignedMentor === 'Yes');
    const unassigned = students.filter(s => s.assignedMentor === 'No');
    const deleted = students.filter(s => s.isDeleted);

    console.log(`\n📊 Summary:`);
    console.log(`Total students: ${students.length}`);
    console.log(`Assigned to mentors: ${assigned.length}`);
    console.log(`Unassigned: ${unassigned.length}`);
    console.log(`Deleted: ${deleted.length}`);

    if (unassigned.length > 0) {
      console.log(`\nUnassigned students:`);
      unassigned.forEach(s => console.log(`  - ${s.roll} (Year ${s.yearOfStudy})`));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkStudentStatus();
