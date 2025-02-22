const express = require("express");
const dotenv = require("dotenv");
const User = require("../models/User");
const Profile = require("../models/Profile");
const cloudinary = require("cloudinary").v2;
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @route GET /api/profile
 * @desc Get logged-in user's profile
 * @access Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /api/profile/:regdNo
 * @desc Get profile by registration number
 * @access Private
 */
router.get("/:regdNo", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ regdNo: req.params.regdNo });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route POST /api/profile
 * @desc Create a new profile
 * @access Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, regdNo, section, mobileNumber, email, admissionType, caste, rank, dob, bloodGroup, tenthMarks, interDiplomaMarks, parentDetails, localGuardian, hobbies, participation, profilePicture, attendance } = req.body;

    if (!name || !regdNo || !email) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ error: "Profile already exists. Use PATCH to update." });
    }

    // Create new profile
    const newProfile = new Profile({
      userId: req.user.id,
      name,
      regdNo,
      section,
      mobileNumber,
      email,
      admissionType,
      caste,
      rank,
      dob,
      bloodGroup,
      tenthMarks,
      interDiplomaMarks,
      parentDetails,
      localGuardian,
      hobbies,
      participation,
      profilePicture,
      attendance
    });

    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (err) {
    console.error("Error creating profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /api/profile/:id
 * @desc Update profile by ID
 * @access Private
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PATCH /api/profile
 * @desc Update profile using userId
 * @access Private
 */
router.patch("/", authMiddleware, async (req, res) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PATCH /api/profile/attendance
 * @desc Update attendance (Admin Only)
 * @access Admin
 */
router.patch("/attendance", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, semester, month, percentage } = req.body;
    if (!userId || !semester || !month || percentage === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    profile.attendance = profile.attendance || [];
    let semesterEntry = profile.attendance.find((s) => s.semester === semester);
    if (!semesterEntry) {
      semesterEntry = { semester, months: {} };
      profile.attendance.push(semesterEntry);
    }
    semesterEntry.months[month] = { percentage };

    await profile.save();
    res.status(200).json({ message: "Attendance updated successfully", profile });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route DELETE /api/profile/:id
 * @desc Delete user profile (Admin Only)
 * @access Admin
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedProfile = await Profile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) return res.status(404).json({ error: "Profile not found" });

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;