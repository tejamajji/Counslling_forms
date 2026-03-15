import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ padding: '20px', maxWidth: '1000px', margin: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
      </Typography>

      <Paper sx={{ padding: '40px', marginTop: '20px', borderRadius: '15px', boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Super Admin Panel
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
          Manage administrators, students, overall reports, and mentor allocations across the entire system.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              color="primary"
              onClick={() => navigate('/superadmin/admins')}
              sx={{ padding: '15px', mb: 2 }}
            >
              Manage Admins
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              color="primary"
              onClick={() => navigate('/superadmin/admins/create')}
              sx={{ padding: '15px' }}
            >
              Create Admin
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
             <Button
              variant="contained"
              fullWidth
              size="large"
              color="secondary"
              onClick={() => navigate('/superadmin/students')}
              sx={{ padding: '15px', mb: 2 }}
            >
              View Students
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              color="secondary"
              onClick={() => navigate('/superadmin/reports')}
              sx={{ padding: '15px' }}
            >
              Overall Reports
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              color="success"
              onClick={() => navigate('/superadmin/allocation')}
              sx={{ padding: '15px', mt: 1 }}
            >
              Mentor Allocation (Assign Students)
            </Button>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/superadmin/overview')}
              sx={{ padding: '15px', mt: 1, backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#0277bd' } }}
            >
              People Overview (Students & Admins)
            </Button>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ padding: '15px', mt: 1, backgroundColor: '#9c27b0', color: '#fff', '&:hover': { backgroundColor: '#7b1fa2' } }}
              onClick={() => navigate('/admin')}
            >
              Admin Panel (Manage Users & Data)
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: '40px' }}>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard')}>
            Back to User Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SuperAdminDashboard;
