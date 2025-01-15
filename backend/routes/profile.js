const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { authMiddleware } = require('../middlewares/authMiddleware'); // Corrected to ensure proper import
const router = express.Router();

/**
 * @route GET /api/profile
 * @desc Get user profile with additional details
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Retrieve user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve profile details
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ user: user.toObject(), profile });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route PATCH /api/profile
 * @desc Update user profile and basic details
 * @access Private
 */
router.patch('/', authMiddleware, async (req, res) => {
  const {
    username,
    profilePicture,
    address,
    contact,
    bio,
    country,
    academicYear,
  } = req.body;

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update user details (basic information)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, profilePicture },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create profile
    const profileUpdate = {
      bio,
      address,
      contact,
      country,
      academicYear,
      profilePicture,
    };

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileUpdate },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ user: updatedUser, profile });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
