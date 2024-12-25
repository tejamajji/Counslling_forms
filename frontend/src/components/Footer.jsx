// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* GVP-IT Info */}
        <p style={styles.info}>© 2024 GVP-IT. All Rights Reserved BY ME NO WORRIES</p>

        {/* Social Media Links */}
        <div style={styles.socialLinks}>
          <a href="https://facebook.com" target="_blank" style={styles.link}>Facebook</a>
          <a href="https://twitter.com" target="_blank" style={styles.link}>Twitter</a>
          <a href="https://linkedin.com" target="_blank" style={styles.link}>LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

// Inline styles for the component
const styles = {
  footer: {
    padding: '20px 0',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    borderTop: '2px solid #ccc',
    marginTop: 'auto',  // Ensures the footer stays at the bottom
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  info: {
    marginBottom: '10px',
    fontSize: '14px',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'color 0.3s ease',
  },
  linkHover: {
    color: '#007bff',
  },
};

export default Footer;
