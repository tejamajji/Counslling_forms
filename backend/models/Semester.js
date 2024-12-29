const mongoose = require('mongoose');

// Subject Schema
const SubjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  mid1: { type: Number, required: true },
  mid2: { type: Number, required: true },
  average: { type: Number, required: true },
  grade: { type: String, required: true },
});

// Unified Semester Schema
const SemesterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },             // Foreign key to identify the student
    semester: { type: Number, required: true },          // Semester number (1-8)
    cgpa: { type: Number, required: true },              // CGPA specific to this semester
    subjects: [SubjectSchema],                           // Array of subjects for the semester
  },
  { timestamps: true }
);

// Unified Semester Model
const Semester = mongoose.model('Semester', SemesterSchema);

// Export the model
module.exports = Semester;
