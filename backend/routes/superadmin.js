const express = require("express");
const router = express.Router();
const { authMiddleware, superAdminMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin"); 

const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

router.post("/admins", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const { employee_name, employee_id, department, email } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create User in users collection
    const newUser = new User({
      username: employee_name,
      email,
      password: hashedPassword,
      role: "admin"
    });
    await newUser.save();

    // Create Admin metadata in admins collection
   const newAdmin = new Admin({
  employee_name,
  employee_id,
  department,
  email
});
await newAdmin.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Admin Account Credentials",
      html: `
        <h3>Hi ${employee_name},</h3>
        <p>Your admin account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in and change your password.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Admin created and email sent." });

  } catch (err) { next(err);
  }
});

router.get("/admins", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (err) { next(err);
  }
});

router.get("/students", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    // Get only users with role "user"
    const students = await User.find({ role: "user" }).select('username email _id role assignedMentor');
    res.json(students);
  } catch (err) { next(err);
  }
});


router.get("/reports", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const className = req.query.class;
    const { startDate, endDate } = req.query;
    
    let query = { role: "user", isDeleted: { $ne: true } };

    if (className) {
      const Profile = require("../models/Profile");
      const profiles = await Profile.find({ section: new RegExp(className, "i"), isDeleted: { $ne: true } });
      const userIds = profiles.map(p => p.userId);
      query._id = { $in: userIds };
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let sortQuery = {};
    if (req.query.sortBy) {
       const [field, order] = req.query.sortBy.split('_');
       sortQuery[field] = order === 'desc' ? -1 : 1;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const User = require('../models/User');
    const students = await User.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('-password -__v -resetPasswordToken -resetPasswordExpires');
      
    res.json(students);
  } catch (err) {
    next(err);
  }
});


// --- Mentor Allocation Routes --- 

// Get mentors and their current assigned students
router.get("/mentors-with-students", authMiddleware, superAdminMiddleware, async (req, res, next) => {
    try {
        const mentors = await User.find({ role: 'admin' }).select('username email _id');
        const mentorsWithStats = await Promise.all(mentors.map(async (m) => {
            const count = await User.countDocuments({ assignedMentor: m._id, role: 'user', isDeleted: { $ne: true } });
            return { ...m.toObject(), assignedStudentsCount: count };
        }));
        res.json(mentorsWithStats);
    } catch (err) { next(err); }
});

// Get unassigned students
router.get("/unassigned-students", authMiddleware, superAdminMiddleware, async (req, res, next) => {
    try {
        // Unassigned students are users with no assignedMentor
        const students = await User.find({
            role: "user",
            $or: [
                { assignedMentor: { $exists: false } },
                { assignedMentor: null }
            ],
            isDeleted: { $ne: true }
        }).select('username email _id');
        res.json(students);
    } catch (err) { next(err); }
});

// Assign students manually or randomly
router.post("/assign-students", authMiddleware, superAdminMiddleware, async (req, res, next) => {
    try {
        const { mentorId, studentIds } = req.body;
        
        if (!mentorId || !studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ error: "Invalid data provided." });
        }

        // Validate mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== 'admin') {
            return res.status(404).json({ error: "Mentor not found." });
        }

        // Assign
        await User.updateMany(
            { _id: { $in: studentIds } },
            { $set: { assignedMentor: mentorId } }
        );

        res.json({ success: true, message: `Assigned ${studentIds.length} students to ${mentor.username}` });
    } catch (err) { next(err); }
});

// Unassign students
router.post("/unassign-students", authMiddleware, superAdminMiddleware, async (req, res, next) => {
    try {
        const { studentIds } = req.body;

        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({ error: "Invalid data provided." });
        }

        // Unassign
        await User.updateMany(
            { _id: { $in: studentIds } },
            { $unset: { assignedMentor: "" } }
        );

        res.json({ success: true, message: `Unassigned ${studentIds.length} students.` });
    } catch (err) { next(err); }
});

module.exports = router;

