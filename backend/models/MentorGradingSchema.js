const mongoose = require('mongoose');

// Define the MentorGrading schema
const MentorGradingSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    ref: 'User',  // Foreign key reference to the User model
    
  },
  grading: {
    generalDiscipline: {
      type: [Number],
      default: [],
      
    },
    communicationSkills: {
      type: [Number],
      default: [],
      
    },
    generalGrooming: {
      type: [Number],
      default: [],
      
    },
    behaviorWithPeers: {
      type: [Number],
      default: [],
      
    },
    behaviorWithFaculty: {
      type: [Number],
      default: [],
      
    },
    coCurricularActivities: {
      type: [Number],
      default: [],
      
    },
    extracurricularActivities: {
      type: [Number],
      default: [],
      
    },
    behaviorInHostel: {
      type: [Number],
      default: [],
      
    },
    overallGrading: {
      type: [Number],
      default: [],
      
    },
    disciplinaryActions: { 
      type: [String], 
      default: [], 
      
    },  // Actions if any
  },
  initials: {
    student: { type: [String], default: [] }, // Array for semesters
    mentor: { type: [String], default: [] },
  },
  dates: { type: [String], default: [] },
    remarks: { 
    type: [String], 
    default: [], 
    
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
