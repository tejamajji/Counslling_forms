import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
  CircularProgress, Typography, Alert, Box, MenuItem, Select
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const subjectList = {
  1: ["Mathematics-I", "Physics", "Chemistry", "C Programming", "Engineering Drawing", "English", "Environmental Science", "Workshop", "IT Essentials", "Basic Electrical"],
  2: ["Mathematics-II", "Data Structures", "Digital Logic", "Object-Oriented Programming", "Discrete Mathematics", "Economics", "Electronic Circuits", "Microprocessors", "Signals & Systems", "Statistics"],
  3: ["Mathematics-III", "Operating Systems", "Database Management Systems", "Computer Networks", "Theory of Computation", "Software Engineering", "Machine Learning Basics", "Artificial Intelligence", "Web Technologies", "Cloud Computing"],
  4: ["Mathematics-IV", "Advanced DBMS", "Computer Architecture", "Design & Analysis of Algorithms", "Data Science", "Cybersecurity", "Blockchain Basics", "Internet of Things", "Mobile App Development", "Compiler Design"],
  5: ["Software Project Management", "Deep Learning", "Big Data Analytics", "DevOps", "Cloud Security", "Full Stack Development", "Quantum Computing", "AR/VR Technologies", "Embedded Systems", "Digital Marketing"],
  6: ["Natural Language Processing", "Robotics", "Game Development", "Human-Computer Interaction", "Ethical Hacking", "Data Visualization", "Computer Vision", "Neural Networks", "Distributed Systems", "Parallel Computing"],
  7: ["Research Methodologies", "Digital Signal Processing", "Bioinformatics", "3D Modeling", "Metaverse Technologies", "Edge Computing", "Autonomous Vehicles", "Social Network Analysis", "Cyber-Physical Systems", "Smart Grids"],
  8: ["Final Year Project", "Entrepreneurship", "Patent Laws", "Advanced AI", "Quantum Machine Learning", "Space Technologies", "Blockchain Advanced", "AI Ethics", "Cognitive Computing", "Innovation Management"]
};

const MarksTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updatedMarks, setUpdatedMarks] = useState([]);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(1); // Start with Semester 1
  const [isSaved, setIsSaved] = useState(false); // Track if the current semester is saved
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail") || "";

  // Fetch semester details
  useEffect(() => {
    if (!email) {
      setError("Email is missing. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchSemesterDetails = async () => {
      try {
        console.log("Fetching data for:", email, selectedSemester);
        const response = await axios.get(
          `http://localhost:5000/api/semester/${encodeURIComponent(email)}/${selectedSemester}`
        );

        if (response.status === 200) {
          setUpdatedMarks(response.data.subjects);
          setIsNewEntry(false);
          setIsSaved(true); // Marks are already saved in the database
        } else {
          throw new Error("Unexpected error occurred.");
        }
      } catch (err) {
        console.error("Error fetching semester details:", err);

        if (err.response?.status === 404) {
          console.log("No existing marks found. Allowing user to enter new marks.");
          setUpdatedMarks(subjectList[selectedSemester].map(subject => ({
            subject,
            mid1: 0,
            mid2: 0,
            ext: "A+"
          })));
          setIsNewEntry(true);
          setIsSaved(false); // Marks are not saved yet
        } else {
          setError("Error retrieving marks. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSemesterDetails();
  }, [email, selectedSemester]);

  // Handle marks change
  const handleMarksChange = (index, field, value) => {
    const updated = [...updatedMarks];
    if (field === "ext") {
      updated[index] = { ...updated[index], [field]: value };
    } else {
      updated[index] = { 
        ...updated[index], 
        [field]: Math.min(30, Math.max(0, Number(value))) 
      };
    }
    setUpdatedMarks(updated);
  };

  // Save marks
  const handleSave = async () => {
    console.log("Updated Marks Data Being Sent:", updatedMarks);

    try {
      let response;
      if (isNewEntry) {
        response = await axios.post(
          `http://localhost:5000/api/semester`,
          { email, semester: selectedSemester, subjects: updatedMarks }
        );
      } else {
        response = await axios.put(
          `http://localhost:5000/api/semester/${encodeURIComponent(email)}/${selectedSemester}`,
          { subjects: updatedMarks }
        );
      }

      if (response.status === 200) {
        setEditMode(false);
        setIsNewEntry(false);
        setIsSaved(true); // Marks are saved successfully
      }
    } catch (err) {
      console.error("Error updating subject marks:", err.response?.data || err);
      setError("Failed to update subject marks.");
    }
  };

  // Move to the next semester
  const handleNextSemester = () => {
    if (selectedSemester < 8) {
      setSelectedSemester(selectedSemester + 1);
      setIsSaved(false); // Reset saved state for the new semester
      setEditMode(false); // Reset edit mode
    }
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button variant="contained" color="secondary" onClick={handleBackToDashboard}>
          Back to Dashboard
        </Button>
        <Typography variant="h6">
          Semester {selectedSemester}
        </Typography>
      </Box>

      <Typography variant="h5" align="center" gutterBottom>
        Semester {selectedSemester} Marks for {email}
      </Typography>

      {error && (
        <Alert severity="error" style={{ marginBottom: "10px" }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Subject</b></TableCell>
              <TableCell><b>Mid 1 (Max 30)</b></TableCell>
              <TableCell><b>Mid 2 (Max 30)</b></TableCell>
              <TableCell><b>External (Grade A+ to F)</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {updatedMarks.map((subject, index) => (
              <TableRow key={index}>
                <TableCell>{subject.subject}</TableCell>
                <TableCell><TextField type="number" value={subject.mid1} onChange={(e) => handleMarksChange(index, "mid1", e.target.value)} variant="outlined" size="small" disabled={!editMode} /></TableCell>
                <TableCell><TextField type="number" value={subject.mid2} onChange={(e) => handleMarksChange(index, "mid2", e.target.value)} variant="outlined" size="small" disabled={!editMode} /></TableCell>
                <TableCell>
                  <Select value={subject.ext} onChange={(e) => handleMarksChange(index, "ext", e.target.value)} variant="outlined" size="small" disabled={!editMode}>
                    {["A+", "A", "B", "C", "D", "E", "F"].map((grade) => <MenuItem key={grade} value={grade}>{grade}</MenuItem>)}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2} gap={2}>
        <Button variant="contained" color={editMode ? "success" : "primary"} onClick={editMode ? handleSave : () => setEditMode(true)}>
          {editMode ? "Save" : "Edit"}
        </Button>
        <Button variant="contained" color="primary" onClick={handleNextSemester} disabled={!isSaved || selectedSemester === 8}>
          Next Semester
        </Button>
      </Box>
    </motion.div>
  );
};

export default MarksTable;