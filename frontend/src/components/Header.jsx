// Header.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gvplog from '../images/gvplogo.jpg'; // Correct import for the logo

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const isLandingPage = location.pathname === '/landingpage';// Check if we're on the landing page
  const issignupPage = location.pathname === '/signup';// Check if we're on the signup page
  const isAuthenticated = localStorage.getItem('authToken');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile && userProfile.profilePicture) {
      setProfilePicture(userProfile.profilePicture);
    }
  }, []);

  const handleRegisterLogin = () => {
    navigate('/signup');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/landingpage');
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logoContainer} onClick={handleLogoClick}>
        <img
          src={gvplog}
          alt="GVP Logo"
          style={styles.logoImage}
        />
      </div>

      {/* Heading */}
      <h1 style={styles.heading}>
        GAYATRI VIDYAPARISHAD COLLEGE OF ENGINEERING (AUTONOMOUS)
      </h1>

      {/* Conditionally render Register/Login or Profile */}
      {issignupPage ? <img
          src={gvplog}
          alt="GVP Logo"
          style={styles.logoImage}
        />  : (isLandingPage || !isAuthenticated) ? (
        <button onClick={handleRegisterLogin} style={styles.button}>
          Register / Login
        </button>
      ) : (
        <div style={styles.profileContainer} onClick={handleProfileClick}>
          <img
            src={profilePicture || 'default-profile.png'}
            alt="Profile"
            style={styles.profileImage}
          />
        </div>
      )}
    </header>
  );
};

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
    cursor: 'pointer',
  },
  logoImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '50%',
    marginRight: '10px',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: '30px',
    margin: 0,
  },
  profileContainer: {
    cursor: 'pointer',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '50%',
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
