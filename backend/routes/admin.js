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
router.get('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = { isDeleted: { $ne: true } };

    // If an admin is requesting, only show users assigned to them
    if (req.user.role === 'admin') {
        query.assignedMentor = req.user._id;
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').lean();
    
    // Calculate profileCompletion for each user
    const usersWithProfiles = await Promise.all(users.map(async (u) => {
      const profile = await Profile.findOne({ userId: u._id });
      let pc = 0;
      if (profile) {
        const requiredFields = [
          profile.name, profile.regdNo, profile.section, profile.mobileNumber, profile.email,
          profile.admissionType, profile.caste, profile.rank, profile.dob, profile.bloodGroup,
          profile.tenthMarks?.percentage, profile.interDiplomaMarks?.percentage,
          profile.parentDetails?.name, profile.parentDetails?.address, profile.parentDetails?.occupation, profile.parentDetails?.contactNumber
        ];
        const answered = requiredFields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
        pc = Math.round((answered / 16) * 100);
      }
      return { ...u, profileCompletion: pc };
    }));

    res.status(200).json(usersWithProfiles);
  } catch (err) { next(err); }
});

/**
 * @route POST /api/admin/users
 * @desc Create a new user (Admin only)
 * @access Admin
 */
router.post('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
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
        role: 'user', // Default role for added students
        assignedMentor: req.user.id
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
  } catch (err) { next(err);
  }
});

/**
 * @route GET /api/admin/users/:id
 * @desc Get user by ID (Admin only)
 * @access Admin
 */
router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) { next(err);
  }
});

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Update user role (Admin only)
 * @access Admin
 */
router.patch('/users/:id/role', authMiddleware, adminMiddleware, async (req, res, next) => {
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
  } catch (err) { next(err);
  }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete user (Admin only)
 * @access Admin
 */
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // First find the user to get their email
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });

    // Delete associated profile
    await Profile.findOneAndUpdate({ userId: req.params.id }, { isDeleted: true });
    
    // Mentor grading/marks can be kept or also soft deleted if we add the flag to those, 
    // for now we just keep the base records soft-deleted.

    res.status(200).json({ message: 'User and associated data soft-deleted successfully' });
  } catch (err) { next(err);
  }
});

/**
 * @route GET /api/admin/profiles
 * @desc Get all profiles (Admin only)
 * @access Admin
 */
router.get('/profiles', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    let profiles;
    if (req.user.role === 'superadmin') {
      profiles = await Profile.find();
    } else {
      const assignedUsers = await User.find({ assignedMentor: req.user._id }).select('_id');
      const assignedIds = assignedUsers.map(u => u._id);
      profiles = await Profile.find({ userId: { $in: assignedIds } });
    }
    res.status(200).json(profiles);
  } catch (err) { next(err);
  }
});

/**
 * @route GET /api/admin/mentorgradings
 * @desc Get all mentor gradings (Admin only)
 * @access Admin
 */
router.get('/mentorgradings', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    let mentorGradings;
    if (req.user.role === 'superadmin') {
      mentorGradings = await MentorGrading.find();
    } else {
      const assignedUsers = await User.find({ assignedMentor: req.user._id }).select('email');
      const assignedEmails = assignedUsers.map(u => u.email);
      mentorGradings = await MentorGrading.find({ email: { $in: assignedEmails } });
    }
    res.status(200).json(mentorGradings);
  } catch (err) { next(err);
  }
});

/**
 * @route GET /api/admin/marks
 * @desc Get all marks (Admin only)
 * @access Admin
 */
router.get('/marks', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    let marks;
    if (req.user.role === 'superadmin') {
      marks = await Marks.find();
    } else {
      const assignedUsers = await User.find({ assignedMentor: req.user._id }).select('email');
      const assignedEmails = assignedUsers.map(u => u.email);
      marks = await Marks.find({ email: { $in: assignedEmails } });
    }
    res.status(200).json(marks);
  } catch (err) { next(err);
  }
});


// Notify student to complete profile
router.post('/notify-profile/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
       return res.status(500).json({ error: 'Email configuration missing on server' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/signup';

    const mailOptions = {
        to: student.email,
        from: process.env.EMAIL_USER,
        subject: 'Action Required: Complete Your Counseling Profile',
        html: `
          <h3>Hello ${student.username.toUpperCase()},</h3>
          <p>You have been reminded by the Administration to complete your profile in the Counseling Dashboard.</p>
          <p>Please log in and update your details as soon as possible.</p>
          <p><a href="${loginUrl}">Click here to Login</a></p>
          <br/>
          <p>Thank you,</p>
          <p>Administration</p>
        `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Profile completion reminder sent successfully' });
  } catch (error) {
    console.error('Error sending profile notification:', error);
    res.status(500).json({ error: 'Failed to send notification email' });
  }
});

// Send Details (Email activation link to student)
router.post('/send-details/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    student.resetPasswordToken = resetToken;
    student.resetPasswordExpiry = resetTokenExpiry;
    await student.save();

    // Create email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account/${resetToken}`;

    const mailOptions = {
        to: student.email,
        from: process.env.EMAIL_USER,
        subject: 'Welcome to the Counseling Dashboard - Activate Your Account',
        text: `Hello ${student.username.toUpperCase()},\n\n` +
              `You have been invited to access the Counseling Dashboard.\n\n` +
              `Your login username is your roll number: ${student.username}\n\n` +
              `Please click on the following link, or paste it into your browser to activate your account and set up your initial password:\n\n` +
              `${resetUrl}\n\n` +
              `If you did not request this, please ignore this email.\n`
    };

    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
            console.error('There was an error sending the email: ', err);
            return res.status(500).json({ error: 'Error sending email' });
        }
        res.status(200).json({ message: 'Activation email sent successfully!' });
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
