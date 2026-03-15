const express = require("express");
const router = express.Router();
const { authMiddleware, superAdminMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Admin = require("../models/admin"); 

const transporter = nodemailer.createTransport({
  service: "Gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const getAdmissionPrefix = (rollNumber) => String(rollNumber || '').trim().slice(0, 3);

const recalculateStudentYears = async () => {
  const students = await User.find({ role: 'user', isDeleted: { $ne: true } })
    .select('_id username yearOfStudy yearAssignmentMode')
    .lean();

  const prefixes = [...new Set(
    students
      .map((s) => getAdmissionPrefix(s.username))
      .filter((p) => /^\d{3}$/.test(p))
  )].sort((a, b) => Number(b) - Number(a));

  const rankByPrefix = {};
  prefixes.forEach((prefix, index) => {
    rankByPrefix[prefix] = index + 1;
  });

  const ops = students
    .map((student) => {
      if (student.yearAssignmentMode === 'manual') return null;
      const prefix = getAdmissionPrefix(student.username);
      const nextYear = rankByPrefix[prefix] || null;
      if (!nextYear || student.yearOfStudy === nextYear) return null;
      return {
        updateOne: {
          filter: { _id: student._id },
          update: { $set: { yearOfStudy: nextYear } }
        }
      };
    })
    .filter(Boolean);

  if (ops.length > 0) {
    await User.bulkWrite(ops);
  }

  return {
    updatedCount: ops.length,
    activePrefixes: prefixes,
    firstYearPrefix: prefixes[0] || null,
    manualLockedCount: students.filter((student) => student.yearAssignmentMode === 'manual').length
  };
};

const softDeleteRoleUser = async (roleUserId, actingUserId) => {
  const roleUser = await User.findOne({
    _id: roleUserId,
    role: { $in: ['admin', 'superadmin'] },
    isDeleted: { $ne: true }
  });

  if (!roleUser) {
    return { status: 404, body: { error: 'User not found' } };
  }

  if (String(roleUser._id) === String(actingUserId)) {
    return { status: 400, body: { error: 'You cannot delete your own account' } };
  }

  if (roleUser.role === 'superadmin') {
    const remainingSuperadmins = await User.countDocuments({
      role: 'superadmin',
      isDeleted: { $ne: true },
      _id: { $ne: roleUser._id }
    });
    if (remainingSuperadmins === 0) {
      return { status: 400, body: { error: 'At least one active superadmin must remain' } };
    }
  }

  if (roleUser.role === 'admin') {
    await User.updateMany(
      { assignedMentor: roleUser._id, role: 'user', isDeleted: { $ne: true } },
      { $unset: { assignedMentor: '' } }
    );
    await Admin.deleteOne({ email: roleUser.email });
  }

  roleUser.isDeleted = true;
  await roleUser.save();

  return { status: 200, body: { deletedId: roleUser._id, deletedRole: roleUser.role } };
};

router.get('/management-users', authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const users = await User.find({
      role: { $in: ['admin', 'superadmin'] },
      isDeleted: { $ne: true }
    })
      .select('_id username email role hasLoggedIn createdAt')
      .lean();

    const adminsMeta = await Admin.find().select('employee_name employee_id department email').lean();
    const metaByEmail = {};
    adminsMeta.forEach((m) => {
      metaByEmail[String(m.email || '').toLowerCase()] = m;
    });

    const result = users.map((u) => {
      const meta = metaByEmail[String(u.email || '').toLowerCase()] || null;
      return {
        _id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        hasLoggedIn: !!u.hasLoggedIn,
        createdAt: u.createdAt,
        employee_name: meta?.employee_name || null,
        employee_id: meta?.employee_id || null,
        department: meta?.department || null
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/management-users/:id', authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const result = await softDeleteRoleUser(req.params.id, req.user._id);
    return res.status(result.status).json(result.body);
  } catch (err) {
    next(err);
  }
});

router.post('/management-users/bulk-delete', authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const userIds = Array.isArray(req.body.userIds) ? req.body.userIds : [];
    if (userIds.length === 0) {
      return res.status(400).json({ error: 'At least one user id is required' });
    }

    const deleted = [];
    const failed = [];

    for (const userId of userIds) {
      const result = await softDeleteRoleUser(userId, req.user._id);
      if (result.status === 200) {
        deleted.push(result.body);
      } else {
        failed.push({ userId, error: result.body?.error || 'Failed to delete user' });
      }
    }

    res.json({
      message: `Deleted ${deleted.length} users. ${failed.length} failed.`,
      deleted,
      failed
    });
  } catch (err) {
    next(err);
  }
});

router.post('/management-users/:id/send-details', authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const adminUser = await User.findOne({ _id: req.params.id, role: 'admin', isDeleted: { $ne: true } });
    if (!adminUser) {
      return res.status(404).json({ error: 'Active admin user not found' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ error: 'Email configuration missing on server' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    adminUser.resetPasswordToken = resetToken;
    adminUser.resetPasswordExpiry = resetTokenExpiry;
    await adminUser.save();

    const activateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminUser.email,
      subject: 'Admin Account Activation',
      text:
        `Hello ${adminUser.username},\n\n` +
        `Your admin account is ready.\n\n` +
        `Email: ${adminUser.email}\n\n` +
        `Please activate your account and set your password:\n${activateUrl}\n\n` +
        `If you did not request this, please ignore this email.\n`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Admin activation details sent successfully.' });
  } catch (err) {
    next(err);
  }
});

router.post('/students/recalculate-years', authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const result = await recalculateStudentYears();
    res.json({
      message: 'Student years recalculated successfully',
      ...result
    });
  } catch (err) {
    next(err);
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

    res.status(201).json({ message: "Admin created. Use Send Details to email credentials manually." });

  } catch (err) { next(err);
  }
});

router.get("/admins", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const admins = await Admin.find().lean();
    const emails = admins.map(a => String(a.email || '').toLowerCase());
    const adminUsers = await User.find({ email: { $in: emails }, role: 'admin' })
      .select('_id email hasLoggedIn isDeleted')
      .lean();

    const userMap = {};
    adminUsers.forEach(u => {
      userMap[String(u.email || '').toLowerCase()] = u;
    });

    const result = admins.map(a => {
      const user = userMap[String(a.email || '').toLowerCase()];
      return {
        ...a,
        userId: user?._id || null,
        hasLoggedIn: !!user?.hasLoggedIn,
        userDeleted: !!user?.isDeleted
      };
    });

    res.json(result);
  } catch (err) { next(err);
  }
});

router.post("/admins/:id/send-details", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const adminMeta = await Admin.findById(req.params.id);
    if (!adminMeta) {
      return res.status(404).json({ error: "Admin metadata not found" });
    }

    const adminUser = await User.findOne({ email: adminMeta.email, role: 'admin', isDeleted: { $ne: true } });
    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({ error: 'Email configuration missing on server' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    adminUser.resetPasswordToken = resetToken;
    adminUser.resetPasswordExpiry = resetTokenExpiry;
    await adminUser.save();

    const activateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminUser.email,
      subject: 'Admin Account Activation',
      text:
        `Hello ${adminUser.username},\n\n` +
        `Your admin account is ready.\n\n` +
        `Email: ${adminUser.email}\n\n` +
        `Please activate your account and set your password:\n${activateUrl}\n\n` +
        `If you did not request this, please ignore this email.\n`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Admin activation details sent successfully.' });
  } catch (err) { next(err); }
});

router.delete("/admins/:id", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const adminMeta = await Admin.findById(req.params.id);
    if (!adminMeta) {
      return res.status(404).json({ error: "Admin metadata not found" });
    }

    const userAdmin = await User.findOne({ email: adminMeta.email, role: 'admin', isDeleted: { $ne: true } });
    if (userAdmin) {
      await User.updateMany(
        { assignedMentor: userAdmin._id, role: 'user', isDeleted: { $ne: true } },
        { $unset: { assignedMentor: "" } }
      );

      userAdmin.isDeleted = true;
      await userAdmin.save();
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({ message: "Admin deleted successfully" });
  } catch (err) { next(err); }
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

// Get students with their profile info and assigned mentor name
router.get("/students-with-profiles", authMiddleware, superAdminMiddleware, async (req, res, next) => {
  try {
    const Profile = require('../models/Profile');
    const students = await User.find({ role: 'user', isDeleted: { $ne: true } })
      .select('username email _id assignedMentor')
      .populate('assignedMentor', 'username email');

    const studentIds = students.map(s => s._id);
    const profiles = await Profile.find({ userId: { $in: studentIds } }).select('userId regdNo name');

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const result = students.map(s => ({
      _id: s._id,
      username: s.username,
      email: s.email,
      assignedMentor: s.assignedMentor || null,
      profile: profileMap[s._id.toString()] || null
    }));

    res.json(result);
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

