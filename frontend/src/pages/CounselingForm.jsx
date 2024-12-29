import React, { useState } from 'react';
import { TextField, Button, Grid, Typography, Container, Box } from '@mui/material';

const CounselingForm = () => {
  const [formData, setFormData] = useState({
    regNo: '',
    section: '',
    mobile: '',
    studentName: '',
    email: '',
    admissionType: '',
    caste: '',
    rank: '',
    dob: '',
    bloodGroup: '',
    tenthMarks: '',
    tenthMaxMarks: '',
    tenthPercentage: '',
    interMarks: '',
    interMaxMarks: '',
    interPercentage: '',
    parentName: '',
    parentAddress: '',
    parentOccupation: '',
    parentContact: '',
    parentEmail: '',
    guardianName: '',
    guardianAddress: '',
    guardianContact: '',
    hobbies: '',
    activities: '',
    attendance: '',
    mentorName: '',
    mentorRemarks: '',
    studentSignature: '',
    mentorSignature: '',
    placementDetails: '',
    entranceExams: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography component="h1" variant="h5" align="center">
          Student Counseling Form
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="regNo"
                label="Registration Number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="section"
                label="Section"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mobile"
                label="Mobile Number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="studentName"
                label="Name of the Student"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="admissionType"
                label="Admission Type"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="caste"
                label="Caste"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="rank"
                label="EAMCET/ECET Rank"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dob"
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="bloodGroup"
                label="Blood Group"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="tenthMarks"
                label="10th Marks"
                type="number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="tenthMaxMarks"
                label="Max Marks"
                type="number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="tenthPercentage"
                label="Percentage"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="interMarks"
                label="Intermediate Marks"
                type="number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="interMaxMarks"
                label="Max Marks"
                type="number"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="interPercentage"
                label="Percentage"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="parentName"
                label="Parent's Name"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="parentAddress"
                label="Parent's Address"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="parentOccupation"
                label="Parent's Occupation"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="parentContact"
                label="Parent's Contact"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="parentEmail"
                label="Parent's Email"
                type="email"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="guardianName"
                label="Guardian's Name"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="guardianAddress"
                label="Guardian's Address"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="guardianContact"
                label="Guardian's Contact"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="hobbies"
                label="Hobbies"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="activities"
                label="Activities"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="attendance"
                label="Attendance"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mentorName"
                label="Mentor's Name"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mentorRemarks"
                label="Mentor's Remarks"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="studentSignature"
                label="Student's Signature"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mentorSignature"
                label="Mentor's Signature"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="placementDetails"
                label="Placement Details"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="entranceExams"
                label="Entrance Exams"
                fullWidth
                required
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }}>
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CounselingForm;