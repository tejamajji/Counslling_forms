const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createPrincipal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingPrincipal = await User.findOne({ role: 'principal' });
    if (existingPrincipal) {
      console.log('Principal user already exists:', existingPrincipal.email);
      return;
    }

    const hashedPassword = await bcrypt.hash('principal123', 10);

    const principal = new User({
      username: 'principal',
      email: 'principal@example.com',
      password: hashedPassword,
      role: 'principal'
    });

    await principal.save();
    console.log('Principal user created successfully');
    console.log('Email: principal@example.com');
    console.log('Password: principal123');

  } catch (error) {
    console.error('Error creating principal:', error);
  } finally {
    process.exit(0);
  }
}

createPrincipal();