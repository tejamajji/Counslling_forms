const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  month: { type: String, required: true },
  percentage: { type: Number, default: 0 } // Attendance stored as percentage
});

const semesterSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  attendance: [attendanceSchema]
});

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, // Foreign key
    regdNo: { type: String, required: true, unique: true }, // Registration Number (Primary key)
    section: { type: String, required: true }, // Section
    mobileNumber: { type: String, required: true }, // Mobile Number
    name: { type: String, required: true }, // Name as per SSC Marks Memo
    email: { type: String, required: true, unique: true }, // Email
    admissionType: { type: String, enum: ["Convener", "Management","Category-B"], required: true }, // Convener or Management admission
    caste: { type: String, required: true }, // Caste
    rank: { type: String, required: true }, // EAMCET / ECET Rank
    dob: { type: String, required: true }, // Date of Birth (dd/mmm/yyyy)
    bloodGroup: { type: String, required: true }, // Blood Group
    tenthMarks: {
      obtained: { type: Number, required: true },
      max: { type: Number, required: true },
      percentage: { type: Number, required: true }
    }, // 10th Marks (marks/max marks & percentage)
    interDiplomaMarks: {
      obtained: { type: Number, required: true },
      max: { type: Number, required: true },
      percentage: { type: Number, required: true }
    }, // Inter/Diploma Marks (marks/max marks & percentage)
    parentDetails: {
      name: { type: String, required: true }, // Parent name as per SSC Memo
      address: { type: String, required: true }, // Home address
      occupation: { type: String, required: true }, // Occupation
      contactNumber: { type: String, required: true }, // Parent contact number
      email: { type: String } // Parent email (optional)
    },
    localGuardian: {
      name: { type: String }, // Local guardian name (if any)
      address: { type: String }, // Local guardian address
      contactNumber: { type: String } // Local guardian contact number
    },
    hobbies: { type: [String] }, // Hobbies
    participation: {
      gamesAndActivities: { type: [String] }, // Participation in Games, NCC/NSS
      literary: { type: [String] }, // Literary Activities
      technical: { type: [String] } // Technical Activities
    },
    profilePicture: { type: String, default: null }, // Profile Picture (default: null)
    attendance: [
      {
        semester: { type: String, required: true },
        months: {
          type: Map,
          of: {
            percentage: { type: Number, default: 0 } // Attendance stored as percentage
          }
        }
      }
    ]
  },
  { timestamps: true }
);

// Middleware to restrict attendance modification to admin users
profileSchema.pre("save", function (next) {
  if (this.isModified("attendance") && !this.adminOverride) {
    const err = new Error("Only admins can modify attendance.");
    return next(err);
  }
  next();
});

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;