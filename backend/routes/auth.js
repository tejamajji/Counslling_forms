const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add the decoded user payload to the request object
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Return username and email in the response
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, username: user.username, email: user.email }); // Return username and email
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