const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    default: 'user',
    enum: ['user', 'admin', 'mentor','superadmin']
  },
  // Add these fields for password reset
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  hasLoggedIn: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: 1 });

module.exports = mongoose.model('User', UserSchema);
