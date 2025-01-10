const mongoose = require('mongoose');

// Subject Schema
const SubjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  mid1: { type: Number, required: true },
  mid2: { type: Number, required: true },
  ext: { type: Number, required: true },
});

// Semester Schema
const SemesterSchema = new mongoose.Schema({
  semester: { type: Number, required: true },
  subjects: [SubjectSchema],
});

// Unified Marks Schema for all semesters
const MarksSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true }, // Unique identifier for a student
    semesters: [SemesterSchema], // Array of semester data
  },
  { timestamps: true }
);

// Unified Marks Model
const Marks = mongoose.model('Marks', MarksSchema);

module.exports = Marks;
