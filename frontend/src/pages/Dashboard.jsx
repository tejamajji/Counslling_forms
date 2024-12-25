// Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if token is available in localStorage
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // Redirect to signup page if token is not found
      navigate('/signup');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Remove token from localStorage and redirect to signup page
    localStorage.removeItem('authToken');
    navigate('/signup');
  };

  return (
    <div style={styles.container}>
      <h2>Welcome to Your Dashboard</h2>
      <p style={styles.welcomeText}>This is your personalized dashboard</p>
      <button onClick={handleLogout} style={styles.button}>Log Out</button>
    </div>
  );
};

// Styles (same as before)
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif',
  },
  welcomeText: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default Dashboard;
