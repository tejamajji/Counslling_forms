const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Profile = require('../models/Profile');
const MentorGrading = require('../models/MentorGradingSchema');
const Marks = require('../models/Semester');

/**
 * @route GET /api/admin/users
 * @desc Get all users (Admin only)
 * @access Admin
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/admin/users/:id
 * @desc Get user by ID (Admin only)
 * @access Admin
 */
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Update user role (Admin only)
 * @access Admin
 */
router.patch('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete user (Admin only)
 * @access Admin
 */
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // First find the user to get their email
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    // Delete associated profile
    await Profile.findOneAndDelete({ userId: req.params.id });
    
    // Delete mentor grading and marks using email
    await MentorGrading.findOneAndDelete({ email: user.email });
    await Marks.findOneAndDelete({ email: user.email });
    
    res.status(200).json({ message: 'User and associated data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/admin/profiles
 * @desc Get all profiles (Admin only)
 * @access Admin
 */
router.get('/profiles', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/admin/mentorgradings
 * @desc Get all mentor gradings (Admin only)
 * @access Admin
 */
router.get('/mentorgradings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const mentorGradings = await MentorGrading.find();
    res.status(200).json(mentorGradings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/admin/marks
 * @desc Get all marks (Admin only)
 * @access Admin
 */
router.get('/marks', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const marks = await Marks.find();
    res.status(200).json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
