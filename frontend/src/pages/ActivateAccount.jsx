import React, { useState } from 'react';
import apiClient from '../apiClient';
import { 
  Container, Typography, TextField, Button, Alert, Paper, 
  Box, CircularProgress 
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';

const ActivateAccount = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await apiClient.post(
        `/api/auth/reset-password/${token}`, 
        { password }
      );
      
      setMessage('Account activated successfully! Redirecting you to login...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/signup');
      }, 3000);
    } catch (err) {
      if (err.response?.status === 400) {
        setTokenValid(false);
        setError('Password reset link is invalid or has expired');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={5}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            Activate Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          
          {tokenValid ? (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="body1" paragraph>
                Please set a password to activate your account.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          ) : (
            <Box textAlign="center" mt={2}>
              <Typography variant="body1" paragraph>
                This activation link is invalid or has expired.
              </Typography>
              <Typography variant="body2">
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  Contact administrator for a new activation link
                </Link>
              </Typography>
            </Box>
          )}
          
          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                Back to Login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ActivateAccount;