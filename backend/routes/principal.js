const express = require("express");
const router = express.Router();
const { authMiddleware, principalMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Department = require("../models/Department");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// GET /departments - List all departments with assigned superadmins
router.get('/departments', authMiddleware, principalMiddleware, async (req, res) => {
  try {
    const departments = await Department.find({})
      .populate('assignedSuperadmins', 'username email')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /assign-superadmin - Assign superadmin to department
router.post('/assign-superadmin', authMiddleware, principalMiddleware, async (req, res) => {
  const { departmentId, email } = req.body;

  // Validate input
  if (!departmentId || !email) {
    return res.status(400).json({ error: 'Department ID and email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but not superadmin, promote them
      if (user.role !== 'superadmin') {
        user.role = 'superadmin';
        user.departmentId = departmentId;
        await user.save();
      } else {
        // If already superadmin, check if assigned to another department
        if (user.departmentId && user.departmentId.toString() !== departmentId) {
          return res.status(400).json({ error: 'User is already assigned to another department' });
        }
        user.departmentId = departmentId;
        await user.save();
      }
    } else {
      // Create new superadmin user
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user = new User({
        username: email.split('@')[0], // Use email prefix as username
        email,
        password: hashedPassword,
        role: 'superadmin',
        departmentId
      });
      await user.save();

      // Send email with credentials
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Super Admin Account Created',
        html: `
          <h2>Welcome to Counselling Forms</h2>
          <p>You have been assigned as a Super Admin for the ${department.name} department.</p>
          <p><strong>Login Credentials:</strong></p>
          <p>Email: ${email}</p>
          <p>Password: ${tempPassword}</p>
          <p>Please change your password after first login.</p>
          <p>Department: ${department.name}</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    // Update department's assigned superadmins
    if (!department.assignedSuperadmins.includes(user._id)) {
      department.assignedSuperadmins.push(user._id);
      await department.save();
    }

    res.json({
      message: 'Super Admin assigned successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: department.name
      }
    });

  } catch (error) {
    console.error('Error assigning superadmin:', error);
    res.status(500).json({ error: 'Failed to assign superadmin' });
  }
});

// DELETE /unassign-superadmin/:userId - Unassign superadmin from department
router.delete('/unassign-superadmin/:userId', authMiddleware, principalMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'superadmin') {
      return res.status(404).json({ error: 'Super Admin not found' });
    }

    const department = await Department.findById(user.departmentId);
    if (department) {
      department.assignedSuperadmins = department.assignedSuperadmins.filter(
        id => id.toString() !== userId
      );
      await department.save();
    }

    // Optionally demote or keep as superadmin but unassigned
    user.departmentId = null;
    await user.save();

    res.json({ message: 'Super Admin unassigned successfully' });

  } catch (error) {
    console.error('Error unassigning superadmin:', error);
    res.status(500).json({ error: 'Failed to unassign superadmin' });
  }
});

module.exports = router;