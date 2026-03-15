import React, { useState, useEffect } from 'react';
import apiClient from '../../apiClient';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Alert, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [mentorGradings, setMentorGradings] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [activeYear, setActiveYear] = useState('325'); // Default 1st year
  const navigate = useNavigate();

  // Fetch users data on component mount
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
        if (userResponse.data.role !== 'admin' && userResponse.data.role !== 'superadmin') {
          setError('You do not have admin privileges');
          navigate('/dashboard');
          return;
        }

        // Fetch users with role "user" only
        const [usersRes, mentorGradingsRes] = await Promise.all([
          apiClient.get('/api/admin/users?role=user', config),
          apiClient.get('/api/admin/mentorgradings', config)
        ]);
        setUsers(usersRes.data);
        setMentorGradings(mentorGradingsRes.data);
      } catch (err) {
        console.error('Error fetching users data:', err);
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

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewUsername('');
    setNewEmail('');
  };

  const handleAddStudent = async () => {
    if (!newUsername.trim() || !newEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('authToken');
    setAddLoading(true);

    try {
      await apiClient.post(
        '/api/admin/users',
        { username: newUsername, email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh users list (only users with role "user")
      const usersRes = await apiClient.get('/api/admin/users?role=user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);

      handleCloseAddDialog();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.response?.data?.error || 'Failed to add student. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all associated data.')) {
      return;
    }

    const token = localStorage.getItem('authToken');

    try {
      await apiClient.delete(
        `/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update users list
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter(u => u.username?.startsWith(activeYear));

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
        Manage Students
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
        <Button variant="outlined" onClick={() => navigate('/admin/data')} sx={{ marginRight: '10px' }}>
          View Data Overview
        </Button>
        <Button variant="contained" color="success" onClick={handleOpenAddDialog}>
          Add Student
        </Button>
      </Box>

      <Box sx={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <Button variant={activeYear === '325' ? 'contained' : 'outlined'} onClick={() => setActiveYear('325')}>1st Year</Button>
        <Button variant={activeYear === '324' ? 'contained' : 'outlined'} onClick={() => setActiveYear('324')}>2nd Year</Button>
        <Button variant={activeYear === '323' ? 'contained' : 'outlined'} onClick={() => setActiveYear('323')}>3rd Year</Button>
        <Button variant={activeYear === '322' ? 'contained' : 'outlined'} onClick={() => setActiveYear('322')}>4th Year</Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Username</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Profile Progress</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const userGrading = mentorGradings.find(g => g.email === user.email);
                const isGraded = userGrading && userGrading.grading && userGrading.grading.overallGrading && userGrading.grading.overallGrading.length > 0;
                
                return (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.profileCompletion !== undefined ? `${user.profileCompletion}%` : '0%'}
                  </TableCell>
                  <TableCell>
                                          {!user.hasLoggedIn && (
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          sx={{ marginRight: '10px' }}
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('authToken');
                              await apiClient.post(`/api/admin/send-details/${user._id}`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              alert('Login details and activation link sent to ' + user.email);
                            } catch (err) {
                              alert('Failed to send details');
                            }
                          }}
                        >
                          Send Details
                        </Button>
                      )}
                      {user.profileCompletion < 100 && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        sx={{ marginRight: '10px' }}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('authToken');
                            await apiClient.post(`/api/admin/notify-profile/${user._id}`, {}, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            alert('Notification sent to ' + user.email);
                          } catch (err) {
                            alert('Failed to send notification');
                          }
                        }}
                      >
                        Notify
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Student Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details for the new student. They will receive an email with their login credentials.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            sx={{ marginTop: '20px' }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddStudent}
            color="primary"
            disabled={addLoading}
          >
            {addLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserManagement;