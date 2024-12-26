const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get Profile (user profile with additional details)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Retrieve user details
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Retrieve profile details (separate Profile model)
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    
    res.json({ ...user.toObject(), profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.patch('/', authMiddleware, async (req, res) => {
  const { username, profilePicture, address, contact, bio, country, academicYear } = req.body;

  try {
    // First, update the user's basic information (if required)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, profilePicture }, // Update basic user details
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Then, update the user's profile details in the Profile model
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      // If profile doesn't exist, create a new profile
      profile = new Profile({
        userId: req.user.id,
        bio,
        address,
        contact,
        country,
        academicYear,
        profilePicture
      });
      await profile.save();
    } else {
      // If profile exists, update it
      profile.bio = bio;
      profile.address = address;
      profile.contact = contact;
      profile.country = country;
      profile.academicYear = academicYear;
      profile.profilePicture = profilePicture;
      await profile.save();
    }

    res.json({ updatedUser, profile }); // Return both updated user and profile data
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
