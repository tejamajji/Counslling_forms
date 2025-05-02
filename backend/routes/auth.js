const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { authMiddleware } = require('../middlewares/authMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Request password reset (generate token and send email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email' });
    }
    
    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();
    
    // Create email transport (using Gmail for example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // set these in your .env file
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Reset URL (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>You requested a password reset</h1>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    // Find user with token and check if token has expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() } // token not expired
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, 10);
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;