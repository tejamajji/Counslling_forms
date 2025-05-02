import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab,
  Alert, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [mentorGradings, setMentorGradings] = useState([]);
  const [marks, setMarks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  // Fetch admin data on component mount
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
        const userResponse = await axios.get('http://localhost:5000/api/auth/user', config);
        if (userResponse.data.role !== 'admin') {
          setError('You do not have admin privileges');
          navigate('/dashboard');
          return;
        }
        
        // Fetch all data
        const [usersRes, profilesRes, mentorGradingsRes, marksRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/profiles', config),
          axios.get('http://localhost:5000/api/admin/mentorgradings', config),
          axios.get('http://localhost:5000/api/admin/marks', config)
        ]);
        
        setUsers(usersRes.data);
        setProfiles(profilesRes.data);
        setMentorGradings(mentorGradingsRes.data);
        setMarks(marksRes.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
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

  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleUpdateRole = async () => {
    const token = localStorage.getItem('authToken');
    
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${selectedUser._id}/role`,
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update users list
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, role: selectedRole } : user
      ));
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all associated data.')) {
      return;
    }
    
    const token = localStorage.getItem('authToken');
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update users list
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
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
        Admin Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ marginBottom: '20px' }}>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Users" />
          <Tab label="Profiles" />
          <Tab label="Mentor Gradings" />
          <Tab label="Marks" />
        </Tabs>
        
        {/* Users Tab */}
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Username</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Role</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => handleOpenRoleDialog(user)}
                        sx={{ marginRight: '10px' }}
                      >
                        Change Role
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Profiles Tab */}
        {tabValue === 1 && (
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
        {tabValue === 2 && (
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
        {tabValue === 3 && (
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
      
      {/* Role Change Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change role for user: {selectedUser?.username} ({selectedUser?.email})
          </DialogContentText>
          <FormControl fullWidth sx={{ marginTop: '20px' }}>
            <InputLabel>Role</InputLabel>
            <Select value={selectedRole} onChange={handleRoleChange}>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateRole} color="primary">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;