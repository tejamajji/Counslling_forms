import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    // Remove token from localStorage and redirect to signup page
    localStorage.removeItem('authToken');
    navigate('/signup');
  };

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <div className="profile-info">
        <img src="profile-picture-url" alt="Profile" />
        <h2>Username</h2>
        <p>Email: user@example.com</p>
        <p>Bio: This is the user bio.</p>
      </div>
      <div className="profile-actions">
        <button onClick={handleEditProfile}>Edit Profile</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;