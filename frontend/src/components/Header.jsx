// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react'; // Importing profile icon

const Header = () => {
  const navigate = useNavigate(); // Hook for navigation
  const isAuthenticated = localStorage.getItem('authToken');

  const handleRegisterLogin = () => {
    // Navigate to /signup when the button is clicked
    navigate('/signup');
  };

  const handleProfileClick = () => {
    // Navigate to /profile when the profile icon is clicked
    navigate('/profile');
  };

  return (
    <header style={styles.header}>
      {/* Dummy Logo */}
      <div style={styles.logoContainer}>
        <div style={styles.logo}></div>
      </div>

      {/* Heading */}
      <h1 style={styles.heading}>GVP-IT</h1>

      {/* Profile Icon */}
      {isAuthenticated ? (
        <User 
          size={24} 
          color="#007bff" 
          style={styles.profileIcon} 
          onClick={handleProfileClick} 
        />
      ) : (
        <button onClick={handleRegisterLogin} style={styles.button}>
          Register / Login
        </button>
      )}
    </header>
  );
};

// Inline styles for the component
const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#f4f4f4',
    borderBottom: '2px solid #ccc',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: '40px',
    height: '40px',
    backgroundColor: '#007bff',
    borderRadius: '50%',
    marginRight: '10px',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: '24px',
    margin: 0,
  },
  profileIcon: {
    cursor: 'pointer',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default Header;