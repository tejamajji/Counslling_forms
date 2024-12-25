import React, { useState, useEffect } from 'react';
import './css/EditProfile.css';

const EditProfile = () => {
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

  const [profilePictureFile, setProfilePictureFile] = useState(null);

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
      const fileURL = URL.createObjectURL(file); // Create a URL for the file
      setProfilePictureFile(fileURL); // Store the URL for displaying the image
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: fileURL, // Save the URL in the user object
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('userProfile', JSON.stringify(user)); // Save the updated profile in localStorage
      console.log('Profile updated successfully:', user);
    } catch (error) {
      console.error('Error saving profile:', error);
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
            <img src={profilePictureFile || user.profilePicture} alt="Profile" />
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
