const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: '',  // Replace with your Cloudinary cloud name
  api_key: '', // Replace with your Cloudinary API key
  api_secret: '', 
});

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

    // Retrieve user details (excluding the password)
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve profile details
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Return the merged response
    res.status(200).json({ user: user.toObject(), profile: profile.toObject() });
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

    let cloudinaryUrl = profilePicture;
    if (profilePicture && profilePicture.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
        folder: 'user_profiles',
      });
      cloudinaryUrl = uploadResponse.secure_url;
    }

    // Update user details (basic information)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, profilePicture: cloudinaryUrl },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update or create profile details
    const profileUpdate = {
      bio,
      address,
      contact,
      country,
      academicYear,
      profilePicture: cloudinaryUrl,
    };

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileUpdate },
      { new: true, upsert: true, runValidators: true }
    );

    // Return a merged response with updated user and profile data
    res.status(200).json({ user: updatedUser.toObject(), profile: updatedProfile.toObject() });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
