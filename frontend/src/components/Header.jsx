import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../apiClient';
import gvplog from '../images/gvplogo.jpg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/landingpage';
  const issignupPage = location.pathname === '/signup';
  const isAuthenticated = localStorage.getItem('authToken');
  const [user, setUser] = useState({ name: '', email: '', profilePicture: '' });

  const hideTranslationBar = () => {
    setTimeout(() => {
      // Add all the requested styles dynamically
      const style = document.createElement('style');
      style.innerHTML = `
      iframe.goog-te-banner-frame {
        display: none !important;
      }
      .skiptranslate {
        font-size: 0rem !important;
      }
      .skiptranslate > span {
        display: none !important;
      }
      #google_translate_element {
        margin-right: 10px;
        display: flex !important;
        align-items: center !important;
      }
      #goog-gt-tt {
        display: none !important;
      }
      .goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
      .goog-te-gadget {
        color: transparent !important;
      }
      .goog-te-combo {
        padding: 4px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }
      /* New styles for pill shape and custom icon */
      .goog-te-gadget-simple {
        border-radius: 50px !important; /* Pill shape */
        padding: 4px 8px !important;
        background-color: #f8f8f8 !important;
        border: 1px solid #ddd !important;
      }
      .goog-te-gadget-icon {
        background-image: url(${gvplog}) !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        width: 24px !important;
        height: 24px !important;
        margin-right: 8px !important;
      }
      .goog-te-gadget-icon img {
        display: none !important; /* Hide default Google icon */
      }
    `;
    document.head.appendChild(style);

      // Additional hiding logic for iframes
      const elements = document.getElementsByClassName("skiptranslate");
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.tagName === "IFRAME") {
          element.style.display = "none";
        }
      }
    }, 1000);
  };

  // Load user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        return;
      }

      try {
        const response = await apiClient.get('/api/auth/user', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setUser({
          name: response.data.username || 'User',
          email: response.data.email || 'Not Available',
          profilePicture: response.data.profilePicture || '',
        });
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated]);

  // Load Google Translate widget
  useEffect(() => {
    if (window.google && window.google.translate) {
      initializeTranslate();
      return;
    }

    const scriptId = 'google-translate-script';
    const existingScript = document.getElementById(scriptId);
    
    if (existingScript) {
      if (window.googleTranslateElementInit) return;
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => console.error('Failed to load Google Translate script');
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        initializeTranslate();
        hideTranslationBar();
      }
    };

    return () => {
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  const initializeTranslate = () => {
    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,gu,te,kn,ta,pa,ml',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    } catch (error) {
      console.error('Error initializing Google Translate:', error);
    }
  };

  const handleRegisterLogin = () => navigate('/signup');
  const handleProfileClick = () => navigate('/profile');
  const handleLogoClick = () => navigate('/landingpage');

  const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: '#f4f4f4',
      borderBottom: '2px solid #ccc',
      position: 'relative',
      zIndex: 1000,
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
      flex: 1,
      textAlign: 'center',
    },
    translator: {
      display: 'flex',
      alignItems: 'center',
      minWidth: '120px',
      height: '40px',
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

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logoContainer} onClick={handleLogoClick}>
        <img src={gvplog} alt="GVP Logo" style={styles.logoImage} />
      </div>

      {/* Heading */}
      <h1 style={styles.heading}>
        GAYATRI VIDYAPARISHAD COLLEGE OF ENGINEERING (AUTONOMOUS)
      </h1>

      {/* Google Translate Widget */}
      <div id="google_translate_element" style={styles.translator}></div>

      {/* Register/Login or Profile */}
      {issignupPage ? (
        <img src={gvplog} alt="GVP Logo" style={styles.logoImage} />
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

export default Header;