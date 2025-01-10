const mongoose = require('mongoose');

// Define the MentorGrading schema
const MentorGradingSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    ref: 'User',  // Foreign key reference to the User model
    validate: {
      // Ensure that the user exists in the database
      validator: async function(value) {
        const user = await mongoose.model('User').findOne({ email: value });
        if (!user) throw new Error('User not found');
      },
      message: 'User not found',
    },
  },
  grading: {
    generalDiscipline: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for General Discipline must be between 1 and 5 and cannot be empty',
      },
    },
    communicationSkills: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Communication Skills must be between 1 and 5 and cannot be empty',
      },
    },
    generalGrooming: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for General Grooming must be between 1 and 5 and cannot be empty',
      },
    },
    behaviorWithPeers: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Behavior with Peers must be between 1 and 5 and cannot be empty',
      },
    },
    behaviorWithFaculty: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Behavior with Faculty must be between 1 and 5 and cannot be empty',
      },
    },
    coCurricularActivities: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Co-Curricular Activities must be between 1 and 5 and cannot be empty',
      },
    },
    extracurricularActivities: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Extracurricular Activities must be between 1 and 5 and cannot be empty',
      },
    },
    behaviorInHostel: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Grades for Behavior in Hostel must be between 1 and 5 and cannot be empty',
      },
    },
    overallGrading: {
      type: [Number],
      default: [],
      validate: {
        validator: (grades) => grades.every((grade) => grade >= 1 && grade <= 5) && grades.length > 0,
        message: 'Overall Grading must be between 1 and 5 and cannot be empty',
      },
    },
    disciplinaryActions: { 
      type: [String], 
      default: [], 
      validate: {
        validator: (actions) => actions.length === 0 || actions.every((action) => typeof action === 'string'),
        message: 'Disciplinary Actions must be an array of strings',
      },
    },  // Actions if any
  },
  initials: {
    student: { type: [String], default: [] }, // Array for semesters
    mentor: { type: [String], default: [] },
  },
  remarks: { 
    type: [String], 
    default: [], 
    validate: {
      validator: (remarks) => remarks.length === 0 || remarks.every((remark) => typeof remark === 'string'),
      message: 'Remarks must be an array of strings',
    },
  }, // Remarks for each semester
  placement: {
    companyName: { type: String, default: null }, // Name of the company student is placed in
    jobRole: { type: String, default: null }, // Role offered by the company
    package: { type: Number, default: null }, // CTC offered (in LPA)
  },
  higherEducation: {
    universityName: { type: String, default: null }, // Name of the university
    courseName: { type: String, default: null }, // Course chosen (e.g., MS, MBA)
    country: { type: String, default: null }, // Country of the university
  },
}, { timestamps: true }); // Add timestamps for creation and update times

// Export the model
module.exports = mongoose.model('MentorGrading', MentorGradingSchema);
