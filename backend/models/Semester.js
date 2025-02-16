const mongoose = require('mongoose');

// Subject Schema
const SubjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  mid1: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 30 // Mid 1 should be between 0 and 30
  },
  mid2: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 30 // Mid 2 should be between 0 and 30
  },
  ext: { 
    type: String, 
    required: true, 
    enum: ["A+", "A", "B", "C", "D", "E", "F"] // External grade should be A+ to F
  },
});

// Semester Schema
const SemesterSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  subjects: [SubjectSchema],
});

// Unified Marks Schema for all semesters
const MarksSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      ref: 'User', 
      lowercase: true, // Ensure email is always stored in lowercase
      trim: true // Remove unnecessary spaces
    }, 
    semesters: [SemesterSchema], // Array of semester data
  },
  { timestamps: true }
);

// Unified Marks Model
const Marks = mongoose.model('Marks', MarksSchema);

module.exports = Marks;
