import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');

    if (!authToken) {
      navigate('/signup');
      return;
    }

    // Set user details from localStorage (or fetch from API if needed)
    setUser({ name: userName || 'User', email: userEmail || 'Not Available' });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/signup');
  };

  return (
    <div style={styles.container}>
      <h2>Welcome to Your Dashboard</h2>
      <p style={styles.text}>Hello, <strong>{user.name}</strong>!</p>
      <p style={styles.text}>Your Email: <strong>{user.email}</strong></p>
      <button onClick={handleLogout} style={styles.button}>Log Out</button>
      <button onClick={() => navigate('/semester')} style={styles.marksButton}>Semester Marks</button>
    </div>
  );
};

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
  text: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '10px',
  },
  marksButton: {
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    margin: '10px',
  },
};

export default Dashboard;
