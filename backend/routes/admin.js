const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Profile = require('../models/Profile');
const MentorGrading = require('../models/MentorGradingSchema');
const Marks = require('../models/Semester');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * @route GET /api/admin/users
 * @desc Get all users (Admin only) - optionally filter by role
 * @access Admin
 */
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    // If role parameter is provided, filter by role
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route POST /api/admin/users
 * @desc Create a new user (Admin only)
 * @access Admin
 */
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate a random password
    const randomPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user' // Default role for added students
    });
    await newUser.save();

    // Send email with credentials (optional - don't fail if email fails)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your Account Credentials',
          html: `
            <h1>Welcome to the Counseling Forms System</h1>
            <p>Your account has been created by an administrator.</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${randomPassword}</p>
            <p>Please log in and change your password after first login.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup">Login Here</a></p>
          `
        };

        await transporter.sendMail(mailOptions);
      } else {
        console.warn('Email credentials not configured. User created but email not sent.');
      }
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // Don't fail the user creation if email fails
    }

    res.status(201).json({
      message: 'User created successfully and credentials sent via email',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
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
