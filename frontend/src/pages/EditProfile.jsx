import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/EditProfile.css';

const EditProfile = () => {
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

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const navigate = useNavigate();

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

        if (response.ok) {
          const data = await response.json();
          setUser(data); // Set fetched profile data into state
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setProfilePictureFile(fileURL);
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: fileURL,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update localStorage with updated user profile
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setUser(updatedUser); // Update the state with the newly updated profile
        navigate('/profile'); // Redirect to profile page after saving changes
      } else {
        console.error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-header">
        <h1>Edit Profile</h1>
      </div>

      <div className="edit-profile-content">
        <div className="edit-profile-left">
          <div className="edit-profile-picture">
            <img
              src={profilePictureFile || user.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="profile-picture-input"
            />
            <button className="edit-btn">Change Profile Picture</button>
          </div>
        </div>

        <div className="edit-profile-right">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={user.username}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={user.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contact</label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={user.contact}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={user.bio}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={user.country}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="academicYear">Academic Year</label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                value={user.academicYear}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
