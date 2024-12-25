// Header.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gvplog from '../images/gvplogo.jpg'; // Correct import for the logo

const Header = () => {
  const navigate = useNavigate(); // Hook for navigation
  const isAuthenticated = localStorage.getItem('authToken');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    // Retrieve user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile && userProfile.profilePicture) {
      setProfilePicture(userProfile.profilePicture); // Set profile picture if available
    }
  }, []);

  const handleRegisterLogin = () => {
    // Navigate to /signup when the button is clicked
    navigate('/signup');
  };

  const handleProfileClick = () => {
    // Navigate to /profile when the profile image is clicked
    navigate('/profile');
  };

  const handleLogoClick = () => {
    // Navigate to the landing page
    navigate('/');
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logoContainer} onClick={handleLogoClick}>
        <img
          src={gvplog} // Dynamically imported logo
          alt="GVP Logo"
          style={styles.logoImage}
        />
      </div>

      {/* Heading */}
      <h1 style={styles.heading}>
        GAYATRI VIDYAPARISHAD COLLEGE OF ENGINEERING (AUTONOMOUS)
      </h1>

      {/* Profile Image or Register/Login Button */}
      {isAuthenticated ? (
        <div style={styles.profileContainer} onClick={handleProfileClick}>
          <img
            src={profilePicture || 'default-profile.png'} // Fallback to a default image if profile picture is unavailable
            alt="Profile"
            style={styles.profileImage}
          />
        </div>
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
    cursor: 'pointer', // Make it clear that the logo is clickable
  },
  logoImage: {
    width: '50px', // Adjust as needed
    height: '50px', // Adjust as needed
    objectFit: 'cover', // Maintain aspect ratio
    borderRadius: '50%', // Optional: Makes the logo circular
    marginRight: '10px',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: '30px',
    margin: 0,
  },
  profileContainer: {
    cursor: 'pointer', // Make the profile container clickable
  },
  profileImage: {
    width: '40px', // Adjust as needed
    height: '40px', // Adjust as needed
    objectFit: 'cover', // Maintain aspect ratio
    borderRadius: '50%', // Makes the image circular
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
