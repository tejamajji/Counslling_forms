import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminDataOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [mentorGradings, setMentorGradings] = useState([]);
  const [marks, setMarks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        navigate('/signup');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        // Check if user is admin
        const userResponse = await apiClient.get('/api/auth/user', config);
        if (userResponse.data.role !== 'admin') {
          setError('You do not have admin privileges');
          navigate('/dashboard');
          return;
        }

        // Fetch all data
        const [profilesRes, mentorGradingsRes, marksRes] = await Promise.all([
          apiClient.get('/api/admin/profiles', config),
          apiClient.get('/api/admin/mentorgradings', config),
          apiClient.get('/api/admin/marks', config)
        ]);

        setProfiles(profilesRes.data);
        setMentorGradings(mentorGradingsRes.data);
        setMarks(marksRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');

        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Data Overview
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}

      <Box sx={{ marginBottom: '20px' }}>
        <Button variant="contained" onClick={() => navigate('/admin')} sx={{ marginRight: '10px' }}>
          Back to Admin Dashboard
        </Button>
        <Button variant="outlined" onClick={() => navigate('/admin/users')}>
          Manage Users
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Profiles" />
          <Tab label="Mentor Gradings" />
          <Tab label="Marks" />
        </Tabs>

        {/* Profiles Tab */}
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Name</b></TableCell>
                  <TableCell><b>Registration No</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Mobile</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile._id}>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>{profile.regdNo}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.mobileNumber}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/profile/${profile.regdNo}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Mentor Gradings Tab */}
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Overall Grading</b></TableCell>
                  <TableCell><b>Disciplinary Actions</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mentorGradings.map((grading) => (
                  <TableRow key={grading._id}>
                    <TableCell>{grading.email}</TableCell>
                    <TableCell>
                      {grading.grading?.overallGrading?.length > 0
                        ? grading.grading.overallGrading.join(', ')
                        : 'No grades yet'}
                    </TableCell>
                    <TableCell>
                      {grading.grading?.disciplinaryActions?.length > 0
                        ? grading.grading.disciplinaryActions.join(', ')
                        : 'None'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/mentorgrade/${grading.email}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Marks Tab */}
        {tabValue === 2 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Semesters Recorded</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark._id}>
                    <TableCell>{mark.email}</TableCell>
                    <TableCell>{mark.semesters.length}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate(`/semester/${mark.email}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDataOverview;