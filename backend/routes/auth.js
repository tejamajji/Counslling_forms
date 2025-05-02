const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { authMiddleware } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/auth/signup
 * @desc Register a user
 * @access Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({ username, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/auth/signin
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/auth/user
 * @desc Get logged in user
 * @access Private
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    // Return user without password
    const user = await User.findById(req.user.id).select('-password');

    // Fetch profile details
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!user || !profile) {
      return res.status(404).json({ error: 'User or profile not found' });
    }

    // Return both user and profile data
    res.status(200).json({
      username: user.username,
      email: user.email,
      profilePicture: profile.profilePicture, // Include profile picture from the Profile schema
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;