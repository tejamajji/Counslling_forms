const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data with token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
  } catch (err) {
    console.error('Error in /signup:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate token with role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return user data with token and role
    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch user details (email and username)
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // Fetch user details
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ 
      error: 'User not found',
      isNewUser: false
    });

    const profile = await Profile.findOne({ userId: req.user.id });
    
    res.status(200).json({
      username: user.username,
      email: user.email,
      role: user.role,
      hasProfile: !!profile,
      profilePicture: profile?.profilePicture || null,
      isNewUser: user.isNewUser || false  // Include new user status
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;