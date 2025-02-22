import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
  CircularProgress, Typography, Alert, Box, Avatar, Select, MenuItem
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    regdNo: "",
    section: "",
    mobileNumber: "",
    email: "",
    admissionType: "",
    caste: "",
    rank: "",
    dob: "",
    bloodGroup: "",
    tenthMarks: { obtained: 0, max: 0, percentage: 0 },
    interDiplomaMarks: { obtained: 0, max: 0, percentage: 0 },
    parentDetails: {
      name: "",
      address: "",
      occupation: "",
      contactNumber: "",
      email: "",
    },
    localGuardian: {
      name: "",
      address: "",
      contactNumber: "",
    },
    hobbies: [],
    participation: {
      gamesAndActivities: [],
      literary: [],
      technical: [],
    },
    profilePicture: "",
    attendance: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const navigate = useNavigate();

  // Check if the token is expired
  const isTokenExpired = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const isExpired = decodedToken.exp * 1000 < Date.now();
      return isExpired;
    } catch (error) {
      return true; // If token is invalid, treat it as expired
    }
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token || isTokenExpired(token)) {
        navigate("/signin");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setFormData(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/signin");
        } else {
          setError("Error fetching profile. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle nested input changes (e.g., parentDetails, tenthMarks)


  const handleNestedInputChange = useCallback((parentField, field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [parentField]: {
        ...prevFormData[parentField],
        [field]: value,
      },
    }));
  }, []);

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedData = { ...formData };

      // If a new profile picture is uploaded, convert it to base64
      if (profilePictureFile) {
        const reader = new FileReader();
        reader.readAsDataURL(profilePictureFile);
        reader.onloadend = () => {
          updatedData.profilePicture = reader.result;
          sendUpdateRequest(updatedData, token);
        };
      } else {
        sendUpdateRequest(updatedData, token);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const sendUpdateRequest = async (data, token) => {
    try {
      const response = await axios.patch("http://localhost:5000/api/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete(`http://localhost:5000/api/profile/${profile._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Profile deleted successfully!");
        navigate("/");
      } catch (error) {
        console.error("Error deleting profile:", error);
        toast.error("Failed to delete profile.");
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}
    >
      <ToastContainer />
      <Typography variant="h5" align="center" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" style={{ marginBottom: "10px" }}>
          {error}
        </Alert>
      )}

      {/* Profile Picture */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Avatar
          src={formData.profilePicture}
          alt="Profile Picture"
          sx={{ width: 100, height: 100 }}
        />
      </Box>
      {editMode && (
        <Box display="flex" justifyContent="center" mb={3}>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </Box>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Field</b></TableCell>
              <TableCell><b>Value</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Basic Details */}
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.name
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Registration Number</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="regdNo"
                    value={formData.regdNo}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.regdNo
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.section
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mobile Number</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.mobileNumber
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.email
                )}
              </TableCell>
            </TableRow>
            {/* Additional Fields */}
            <TableRow>
              <TableCell>Admission Type</TableCell>
              <TableCell>
                {editMode ? (
                  <Select
                    name="admissionType"
                    value={formData.admissionType}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="Convener">Convener</MenuItem>
                    <MenuItem value="Management">Management</MenuItem>
                    <MenuItem value="Category-B">Category-B</MenuItem>
                  </Select>
                ) : (
                  formData.admissionType
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Caste</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="caste"
                    value={formData.caste}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.caste
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.rank
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Date of Birth</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.dob
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Blood Group</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.bloodGroup
                )}
              </TableCell>
            </TableRow>
            {/* 10th Marks */}
            <TableRow>
              <TableCell>10th Marks (Obtained)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="tenthMarks.obtained"
                    value={formData.tenthMarks.obtained}
                    onChange={(e) => handleNestedInputChange("tenthMarks", "obtained", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.tenthMarks.obtained
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>10th Marks (Max)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="tenthMarks.max"
                    value={formData.tenthMarks.max}
                    onChange={(e) => handleNestedInputChange("tenthMarks", "max", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.tenthMarks.max
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>10th Marks (Percentage)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="tenthMarks.percentage"
                    value={formData.tenthMarks.percentage}
                    onChange={(e) => handleNestedInputChange("tenthMarks", "percentage", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.tenthMarks.percentage
                )}
              </TableCell>
            </TableRow>
            {/* Inter/Diploma Marks */}
            <TableRow>
              <TableCell>Inter/Diploma Marks (Obtained)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="interDiplomaMarks.obtained"
                    value={formData.interDiplomaMarks.obtained}
                    onChange={(e) => handleNestedInputChange("interDiplomaMarks", "obtained", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.interDiplomaMarks.obtained
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Inter/Diploma Marks (Max)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="interDiplomaMarks.max"
                    value={formData.interDiplomaMarks.max}
                    onChange={(e) => handleNestedInputChange("interDiplomaMarks", "max", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.interDiplomaMarks.max
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Inter/Diploma Marks (Percentage)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="interDiplomaMarks.percentage"
                    value={formData.interDiplomaMarks.percentage}
                    onChange={(e) => handleNestedInputChange("interDiplomaMarks", "percentage", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.interDiplomaMarks.percentage
                )}
              </TableCell>
            </TableRow>
            {/* Parent Details */}
            <TableRow>
              <TableCell>Parent Name</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="parentDetails.name"
                    value={formData.parentDetails.name}
                    onChange={(e) => handleNestedInputChange("parentDetails", "name", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.parentDetails.name
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Parent Address</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="parentDetails.address"
                    value={formData.parentDetails.address}
                    onChange={(e) => handleNestedInputChange("parentDetails", "address", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.parentDetails.address
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Parent Occupation</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="parentDetails.occupation"
                    value={formData.parentDetails.occupation}
                    onChange={(e) => handleNestedInputChange("parentDetails", "occupation", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.parentDetails.occupation
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Parent Contact Number</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="parentDetails.contactNumber"
                    value={formData.parentDetails.contactNumber}
                    onChange={(e) => handleNestedInputChange("parentDetails", "contactNumber", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.parentDetails.contactNumber
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Parent Email</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="parentDetails.email"
                    value={formData.parentDetails.email}
                    onChange={(e) => handleNestedInputChange("parentDetails", "email", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.parentDetails.email
                )}
              </TableCell>
            </TableRow>
            {/* Local Guardian Details */}
            <TableRow>
              <TableCell>Local Guardian Name</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="localGuardian.name"
                    value={formData.localGuardian.name}
                    onChange={(e) => handleNestedInputChange("localGuardian", "name", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.localGuardian.name
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Local Guardian Address</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="localGuardian.address"
                    value={formData.localGuardian.address}
                    onChange={(e) => handleNestedInputChange("localGuardian", "address", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.localGuardian.address
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Local Guardian Contact Number</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="localGuardian.contactNumber"
                    value={formData.localGuardian.contactNumber}
                    onChange={(e) => handleNestedInputChange("localGuardian", "contactNumber", e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.localGuardian.contactNumber
                )}
              </TableCell>
            </TableRow>
            {/* Hobbies */}
            <TableRow>
              <TableCell>Hobbies</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="hobbies"
                    value={formData.hobbies.join(", ")}
                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value.split(", ") })}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.hobbies.join(", ")
                )}
              </TableCell>
            </TableRow>
            {/* Participation */}
            <TableRow>
              <TableCell>Games & Activities</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="participation.gamesAndActivities"
                    value={formData.participation.gamesAndActivities.join(", ")}
                    onChange={(e) => handleNestedInputChange("participation", "gamesAndActivities", e.target.value.split(", "))}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.participation.gamesAndActivities.join(", ")
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Literary Activities</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="participation.literary"
                    value={formData.participation.literary.join(", ")}
                    onChange={(e) => handleNestedInputChange("participation", "literary", e.target.value.split(", "))}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.participation.literary.join(", ")
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Technical Activities</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="participation.technical"
                    value={formData.participation.technical.join(", ")}
                    onChange={(e) => handleNestedInputChange("participation", "technical", e.target.value.split(", "))}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                ) : (
                  formData.participation.technical.join(", ")
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2} gap={2}>
  <Button
    variant="contained"
    color={editMode ? "success" : "primary"}
    onClick={editMode ? handleSubmit : () => setEditMode(true)}
  >
    {editMode ? "Save" : "Edit"}
  </Button>
  
  <Button
    variant="contained"
    color="error"
    onClick={handleDeleteProfile}
  >
    Delete Profile
  </Button>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => navigate('/dashboard')}
  >
    Back to Dashboard
  </Button>
</Box>
    </motion.div>
  );
};

export default Profile;