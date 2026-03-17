const mongoose = require('mongoose');
const Department = require('./models/Department');
require('dotenv').config();

const departments = [
  { name: 'Computer Science Engineering', code: 'CSE' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics and Communication Engineering', code: 'ECE' },
  { name: 'Computer Science and Design', code: 'CSD' },
  { name: 'Mechanical Engineering', code: 'MECH' },
  { name: 'Computer Science and Engineering (AIML)', code: 'CSM' },
  { name: 'Civil Engineering', code: 'CIVIL' },
  { name: 'Chemical Engineering', code: 'CHEMICAL' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE' }
];

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const dept of departments) {
      const existing = await Department.findOne({ code: dept.code });
      if (!existing) {
        await Department.create(dept);
        console.log(`Created department: ${dept.name}`);
      } else {
        console.log(`Department ${dept.name} already exists`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
}

seedDepartments();