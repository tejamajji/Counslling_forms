const mongoose = require('mongoose');

// Profile Schema
const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, default: '' },
  address: { type: String, default: '' },
  contact: { type: String, default: '' },
  country: { type: String, default: '' },
  academicYear: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
}, { timestamps: true });

// Profile Model
module.exports = mongoose.model('Profile', ProfileSchema);
