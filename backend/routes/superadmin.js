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

router.post("/admins", authMiddleware, superAdminMiddleware, async (req, res) => {
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/admins", authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

