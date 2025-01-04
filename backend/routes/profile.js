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

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // Add role field with default value 'user'
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body; // Include role in the request body

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role }); // Save role in the user document
    await newUser.save();
    const newProfile = new Profile({
      userId: newUser._id, // Linking profile to user
      bio: '',
      address: '',
      contact: '',
      country: '',
      academicYear: '',
      profilePicture: '',
    });
    await newProfile.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Include role in the token
    res.json({ token, role: user.role }); // Send role in the response
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/SignUp.css'; // Import CSS file

const Auth = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/18.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/19.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/20.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/21.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/22.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/23.jpg",
    // Add more images here
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  },);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/auth/${isSignUp ? 'signup' : 'signin'}`;
      const body = {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        if (data.role === 'admin') {
          navigate('/admin-landing');
        } else {
          navigate('/user-landing');
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error, please try again later');
    }
  };

  return (
    <div className="container">
      <div className="imageContainer">
        <img
          src={images[currentImage]}
          alt="Slideshow"
          className="image"
        />
      </div>

      <div className="formContainer">
        <div className="card">
          <h2 className="heading">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="form">
            {isSignUp && (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
                required
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="input"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input"
              required
            />
            {isSignUp && (
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="input"
                required
              />
            )}
            <button type="submit" className="button">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>

          <p className="toggleText" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
