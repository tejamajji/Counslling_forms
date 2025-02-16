import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, TextField, Button, Alert, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Rating
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

const MentorGrading = () => {
  const { email } = useParams(); // Get the student's email from the URL
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mentorGrading, setMentorGrading] = useState({
    email: email,
    grading: {
      generalDiscipline: [],
      communicationSkills: [],
      generalGrooming: [],
      behaviorWithPeers: [],
      behaviorWithFaculty: [],
      coCurricularActivities: [],
      extracurricularActivities: [],
      behaviorInHostel: [],
      overallGrading: [],
    },
    remarks: [],
    placement: {
      companyName: "",
      jobRole: "",
      package: null,
    },
    higherEducation: {
      universityName: "",
      courseName: "",
      country: "",
    },
    initials: {
      student: [],
      mentor: [],
    },
  });
  const [semester, setSemester] = useState(1); // Current semester (1-indexed)
  const [isMentor, setIsMentor] = useState(false); // Check if the user is a mentor
  const [isSaved, setIsSaved] = useState(false); // Track if the current semester is saved

  // Fetch mentor grading data for the student
  useEffect(() => {
    const fetchMentorGrading = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/mentorgrading/${email}`);
        if (response.status === 200) {
          setMentorGrading(response.data);
          setIsSaved(response.data.grading.generalDiscipline.length >= semester); // Check if the current semester is saved
        } else {
          throw new Error("Failed to fetch mentor grading data");
        }
      } catch (err) {
        console.error("Error fetching mentor grading data:", err);
        setError("Failed to fetch mentor grading data");
      } finally {
        setLoading(false);
      }
    };

    fetchMentorGrading();
  }, [email, semester]);

  // Check if the user is a mentor (replace this with your actual mentor check logic)
  useEffect(() => {
    const checkMentor = async () => {
      const userRole = localStorage.getItem("userRole"); // Example: Get user role from localStorage
      setIsMentor(userRole === "mentor");
    };

    checkMentor();
  }, []);

  // Handle changes in grading fields (only for mentors)
  const handleGradingChange = (field, value) => {
    if (!isMentor) return; // Only mentors can edit
    setMentorGrading((prev) => ({
      ...prev,
      grading: {
        ...prev.grading,
        [field]: [
          ...prev.grading[field].slice(0, semester - 1), // Keep previous semesters' grades
          value, // Update the current semester's grade
          ...prev.grading[field].slice(semester), // Keep grades for subsequent semesters
        ],
      },
    }));
  };

  // Handle changes in remarks (only for mentors)
  const handleRemarksChange = (value) => {
    if (!isMentor) return; // Only mentors can edit
    setMentorGrading((prev) => ({
      ...prev,
      remarks: [
        ...prev.remarks.slice(0, semester - 1), // Keep previous semesters' remarks
        value, // Update the current semester's remarks
        ...prev.remarks.slice(semester), // Keep remarks for subsequent semesters
      ],
    }));
  };

  // Handle changes in initials (only for mentors)
  const handleInitialsChange = (type, value) => {
    if (!isMentor) return; // Only mentors can edit
    setMentorGrading((prev) => ({
      ...prev,
      initials: {
        ...prev.initials,
        [type]: [
          ...prev.initials[type].slice(0, semester - 1), // Keep previous semesters' initials
          value, // Update the current semester's initials
          ...prev.initials[type].slice(semester), // Keep initials for subsequent semesters
        ],
      },
    }));
  };

  // Handle changes in placement details (only for users)
  const handlePlacementChange = (field, value) => {
    if (isMentor) return; // Only users can edit
    setMentorGrading((prev) => ({
      ...prev,
      placement: {
        ...prev.placement,
        [field]: value,
      },
    }));
  };

  // Handle changes in higher education details (only for users)
  const handleHigherEducationChange = (field, value) => {
    if (isMentor) return; // Only users can edit
    setMentorGrading((prev) => ({
      ...prev,
      higherEducation: {
        ...prev.higherEducation,
        [field]: value,
      },
    }));
  };

  // Save mentor grading data (only for mentors)
  const handleSave = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/mentorgrading/${email}`, mentorGrading);
      if (response.status === 200 || response.status === 201) {
        setError("");
        setIsSaved(true); // Mark the current semester as saved
        alert("Grading data saved successfully!");
      } else {
        throw new Error("Failed to save grading data");
      }
    } catch (err) {
      console.error("Error saving mentor grading data:", err);
      setError("Failed to save grading data");
    }
  };

  // Navigate to the next semester (only for mentors if all fields are filled)
  const handleNextSemester = async () => {
    if (semester < 8) {
      if (isMentor && !isSaved) {
        await handleSave(); // Save the current semester before proceeding
      }
      setSemester(semester + 1);
      setIsSaved(false); // Reset saved status for the new semester
    }
  };

  // Navigate to the previous semester
  const handlePreviousSemester = () => {
    if (semester > 1) {
      setSemester(semester - 1);
      setIsSaved(true); // Assume the previous semester is saved
    }
  };

  // Navigate back to the dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard"); // Replace with your dashboard route
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Mentor Grading for {email}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: "20px" }}>
          {error}
        </Alert>
      )}

      <Box sx={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
        <Box>
          <Button variant="contained" onClick={handlePreviousSemester} disabled={semester === 1}>
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNextSemester}
            disabled={semester === 8}
            sx={{ marginLeft: "10px" }}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Semester {semester}
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ marginBottom: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Category</b></TableCell>
              <TableCell><b>Grade</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(mentorGrading.grading).map((field) => (
              <TableRow key={field}>
                <TableCell>{field}</TableCell>
                <TableCell>
                  {isMentor ? (
                    <Rating
                      name={field}
                      value={mentorGrading.grading[field][semester - 1] || 0}
                      onChange={(e, newValue) => handleGradingChange(field, newValue)}
                      max={5}
                    />
                  ) : (
                    <Rating
                      name={field}
                      value={mentorGrading.grading[field][semester - 1] || 0}
                      readOnly
                      max={5}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="h6">Remarks</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={mentorGrading.remarks[semester - 1] || ""}
          onChange={(e) => handleRemarksChange(e.target.value)}
          variant="outlined"
          disabled={!isMentor}
        />
      </Box>

      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="h6">Initials</Typography>
        <Box sx={{ marginBottom: "10px" }}>
          <Typography>Student Initials</Typography>
          <Rating
            name="student-initials"
            value={mentorGrading.initials.student[semester - 1] || 0}
            onChange={(e, newValue) => handleInitialsChange("student", newValue)}
            max={5}
            disabled={!isMentor}
          />
        </Box>
        <Box>
          <Typography>Mentor Initials</Typography>
          <Rating
            name="mentor-initials"
            value={mentorGrading.initials.mentor[semester - 1] || 0}
            onChange={(e, newValue) => handleInitialsChange("mentor", newValue)}
            max={5}
            disabled={!isMentor}
          />
        </Box>
      </Box>

      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="h6">Placement Details</Typography>
        <TextField
          label="Company Name"
          value={mentorGrading.placement.companyName}
          onChange={(e) => handlePlacementChange("companyName", e.target.value)}
          fullWidth
          sx={{ marginBottom: "10px" }}
          disabled={isMentor}
        />
        <TextField
          label="Job Role"
          value={mentorGrading.placement.jobRole}
          onChange={(e) => handlePlacementChange("jobRole", e.target.value)}
          fullWidth
          sx={{ marginBottom: "10px" }}
          disabled={isMentor}
        />
        <TextField
          label="Package (LPA)"
          type="number"
          value={mentorGrading.placement.package || ""}
          onChange={(e) => handlePlacementChange("package", e.target.value)}
          fullWidth
          disabled={isMentor}
        />
      </Box>

      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="h6">Higher Education Details</Typography>
        <TextField
          label="University Name"
          value={mentorGrading.higherEducation.universityName}
          onChange={(e) => handleHigherEducationChange("universityName", e.target.value)}
          fullWidth
          sx={{ marginBottom: "10px" }}
          disabled={isMentor}
        />
        <TextField
          label="Course Name"
          value={mentorGrading.higherEducation.courseName}
          onChange={(e) => handleHigherEducationChange("courseName", e.target.value)}
          fullWidth
          sx={{ marginBottom: "10px" }}
          disabled={isMentor}
        />
        <TextField
          label="Country"
          value={mentorGrading.higherEducation.country}
          onChange={(e) => handleHigherEducationChange("country", e.target.value)}
          fullWidth
          disabled={isMentor}
        />
      </Box>

      {isMentor && (
        <Box display="flex" justifyContent="center">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MentorGrading;