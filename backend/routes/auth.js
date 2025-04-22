const express = require('express');
const bcrypt = require('bcrypt');
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
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Enhanced Signup with new user flag
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        error: 'User already exists',
        isNewUser: false
      });
    }

    // Create new user with isNew flag
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      isNewUser: true  // Flagging new users
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });

    res.status(201).json({ 
      token, 
      username: user.username, 
      email: user.email,
      hasProfile: false,
      isNewUser: true  // Explicitly indicating this is a new user
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error during signup',
      isNewUser: false
    });
  }
});

// Enhanced Signin with new user check
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ 
      error: 'User not found',
      isNewUser: false
    });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ 
      error: 'Invalid credentials',
      isNewUser: false
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });
    
    const profile = await Profile.findOne({ userId: user._id });
    
    res.json({ 
      token, 
      username: user.username, 
      email: user.email,
      hasProfile: !!profile,
      isNewUser: user.isNewUser || false  // Return new user status
    });

    // Update isNewUser flag after first login if needed
    if (user.isNewUser) {
      user.isNewUser = false;
      await user.save();
    }
  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      isNewUser: false
    });
  }
});

// Enhanced User Details with new user flag
router.get('/user', authMiddleware, async (req, res) => {
  try {
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
    res.status(500).json({ 
      error: 'Server error',
      isNewUser: false
    });
  }
});

// Logout remains unchanged
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;