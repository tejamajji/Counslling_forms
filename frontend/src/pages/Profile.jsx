import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    address: '1234 Main Street, City',
    contact: '+1234567890',
    bio: 'A passionate college student excited to learn and grow.',
    country: 'India',
    academicYear: '2nd Year',
    profilePicture: 'profile-picture-url',
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userProfile'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/signup');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Student Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-left">
          <div className="profile-picture">
            <img src={user.profilePicture} alt="Profile" />
            <button className="edit-btn" onClick={handleEditProfile}>Edit Profile</button>
          </div>
        </div>

        <div className="profile-right">
          <h2>{user.username}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Contact:</strong> {user.contact}</p>
          <p><strong>Bio:</strong> {user.bio}</p>
          <p><strong>Country:</strong> {user.country}</p>
          <p><strong>Academic Year:</strong> {user.academicYear}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Profile;
