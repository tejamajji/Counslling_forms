const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get Profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.patch('/', authMiddleware, async (req, res) => {
  const { username, profilePicture } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, profilePicture },
      { new: true }
    ).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
