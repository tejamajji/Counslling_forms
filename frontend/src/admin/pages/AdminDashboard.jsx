import React, { useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/signup');
        return;
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      try {
        const userResponse = await apiClient.get('/api/auth/user', config);
        if (userResponse.data.role !== 'admin') {
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/dashboard');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  return (
    <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Paper sx={{ padding: '40px', marginTop: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Choose an action:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/admin/users')}
            sx={{ padding: '15px' }}
          >
            Manage Users
          </Button>
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/admin/data')}
            sx={{ padding: '15px' }}
          >
            View Data Overview
          </Button>
        </Box>
        
        <Box sx={{ marginTop: '40px' }}>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;