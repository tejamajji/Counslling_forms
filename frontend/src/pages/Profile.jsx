import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    address: '',
    contact: '',
    bio: '',
    country: '',
    academicYear: '',
    profilePicture: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        // Destructure data to separate user and profile
        const { profile, ...userData } = data;
        setUser({ ...userData, ...profile }); // Merge both user and profile data
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Unable to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/signin');
  };

  // Function to check if a value exists, otherwise return 'N/A'
  const displayValue = (value) => {
    return value && value !== "" ? value : 'N/A';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Student Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-left">
          <div className="profile-picture">
            {/* Ensure that there's a fallback image URL */}
            <img
              src={user.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-img"
            />
            <button className="edit-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-right">
          <h2>{displayValue(user.username)}</h2>
          <p><strong>Email:</strong> {displayValue(user.email)}</p>
          <p><strong>Address:</strong> {displayValue(user.address)}</p>
          <p><strong>Contact:</strong> {displayValue(user.contact)}</p>
          <p><strong>Bio:</strong> {displayValue(user.bio)}</p>
          <p><strong>Country:</strong> {displayValue(user.country)}</p>
          <p><strong>Academic Year:</strong> {displayValue(user.academicYear)}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Profile;
