import React from 'react';
import { Container, Typography, Button, Grid, Box } from '@mui/material';

const AdminLandingPage = () => {
  const handleViewStudents = () => {
    // Logic to view students enrolled under the admin
  };

  const handleCheckStudentDetails = () => {
    // Logic to check student details
  };

  const handleAddStudent = () => {
    // Logic to add a new student
  };

  const handleRemoveStudent = () => {
    // Logic to remove a student
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Admin
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleViewStudents}>
              View Students Enrolled
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={handleCheckStudentDetails}>
              Check Student Details
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={handleAddStudent}>
              Add Student
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error" onClick={handleRemoveStudent}>
              Remove Student
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminLandingPage;