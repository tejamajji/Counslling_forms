// Header.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import gvplog from '../images/gvplogo.jpg'; // Correct import for the logo

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const isLandingPage = location.pathname === '/landingpage'; // Check if we're on the landing page
  const issignupPage = location.pathname === '/signup'; // Check if we're on the signup page
  const isAuthenticated = localStorage.getItem('authToken');
  //const [profilePicture, setProfilePicture] = useState(null);
  const [user, setUser] = useState({ name: '', email: '', profilePicture: '' });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const authToken = localStorage.getItem('authToken');
  
      if (!authToken) {
        console.log('No auth token found. Redirecting to /signup');
        navigate('/signup');
        return;
      }
  
      try {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
  
        console.log("Fetched Email from localStorage:", userEmail);
        console.log("Fetched Username from localStorage:", userName);
  
        // Fetch additional details from the backend
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        console.log('User Details from Backend:', response.data);
  
        // Update the user state using a functional update to avoid unnecessary re-renders
        setUser((prevUser) => ({
          ...prevUser,
          name: response.data.username || prevUser.name || userName || 'User',
          email: response.data.email || prevUser.email || userEmail || 'Not Available',
          profilePicture: response.data.profilePicture || prevUser.profilePicture || '', 
        }));
  
      } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response?.status === 401) {
          navigate('/signup');
        }
      }
    };
  
    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [navigate, isAuthenticated]); // Remove 'user' from dependencies
  
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
      {issignupPage ? (
        <img
          src={gvplog}
          alt="GVP Logo"
          style={styles.logoImage}
        />
      ) : isLandingPage || !isAuthenticated ? (
        <button onClick={handleRegisterLogin} style={styles.button}>
          Register / Login
        </button>
      ) : (
        <div style={styles.profileContainer} onClick={handleProfileClick}>
          <img
            src={user.profilePicture || 'default-profile.png'}
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