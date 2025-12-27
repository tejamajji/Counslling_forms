import React, { useState, useEffect } from "react";
import apiClient from "../apiClient";
import { useNavigate } from "react-router-dom";
import "./css/Profile.css"; // We'll create this CSS file separately

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    regdNo: "",
    section: "",
    mobileNumber: "",
    email: "",
    admissionType: "Convener", // default value
    caste: "",
    rank: "",
    dob: "",
    bloodGroup: "",
    tenthMarks: { obtained: "", max: "", percentage: "" },
    interDiplomaMarks: { obtained: "", max: "", percentage: "" },
    parentDetails: {
      name: "",
      address: "",
      occupation: "",
      contactNumber: "",
      email: "",
    },
    localGuardian: {
      name: "",
      address: "",
      contactNumber: "",
    },
    hobbies: [],
    participation: {
      gamesAndActivities: [],
      literary: [],
      technical: [],
    },
    profilePicture: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/signup");
        return;
      }

      try {
        const response = await apiClient.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.profile) {
          setProfile(response.data.profile);
          setFormData(response.data.profile);
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
          // Get user email for the form
          const userResponse = await apiClient.get("/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(prev => ({
            ...prev,
            email: userResponse.data.email || ""
          }));
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setIsNewUser(true);
        } else {
          setError("Error fetching profile. Please try again.");
          console.error("Profile fetch error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleArrayChange = (parent, field, value) => {
    const arrayValue = value.split(",").map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: arrayValue }
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/signup");
      return;
    }
  
    try {
      // Validate required fields
      if (!formData.name || !formData.regdNo || !formData.email) {
        throw new Error("Name, Registration Number, and Email are required");
      }
  
      // Clean up form data before sending
      const dataToSend = {
        ...formData,
        // Remove any fields that shouldn't be updated
        userId: undefined,
        regdNo: isNewUser ? formData.regdNo : undefined,
        email: isNewUser ? formData.email : undefined
      };
  
      let response;
      if (isNewUser) {
        response = await apiClient.post(
          "/api/profile",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await apiClient.patch(
          "/api/profile",
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      // Handle both response formats (POST returns 'profile', PATCH returns 'profile' in data)
      const updatedProfile = response.data.profile || response.data;
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsNewUser(false);
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Save error:", error);
      // Better error message handling
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message || 
                          "Failed to save profile. Please check your data.";
      setError(errorMessage);
      
      // If it's a validation error, show more details
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .map(err => err.message)
          .join(", ");
        setError(`Validation errors: ${validationErrors}`);
      }
    }
  };

  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'basic':
        return (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label>Name:</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
              <div className="form-group">
                <label>Registration Number:</label>
                <input
                  name="regdNo"
                  value={formData.regdNo}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Section:</label>
                <input
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email:</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled // Email comes from user account
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Admission Type:</label>
                <select
                  name="admissionType"
                  value={formData.admissionType}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                >
                  <option value="Convener">Convener</option>
                  <option value="Management">Management</option>
                  <option value="Category-B">Category-B</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Caste:</label>
                <input
                  name="caste"
                  value={formData.caste}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
              <div className="form-group">
                <label>Rank:</label>
                <input
                  name="rank"
                  value={formData.rank}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
              <div className="form-group">
                <label>Blood Group:</label>
                <input
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
            </div>
          </div>
        );
      
      case 'academic':
        return (
          <div className="tab-content">
            <div className="card">
              <h3>10th Marks</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Obtained:</label>
                  <input
                    type="number"
                    value={formData.tenthMarks.obtained}
                    onChange={(e) => handleNestedChange("tenthMarks", "obtained", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Max:</label>
                  <input
                    type="number"
                    value={formData.tenthMarks.max}
                    onChange={(e) => handleNestedChange("tenthMarks", "max", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Percentage:</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      value={formData.tenthMarks.percentage}
                      onChange={(e) => handleNestedChange("tenthMarks", "percentage", e.target.value)}
                      disabled={!isEditing && !isNewUser}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3>Inter/Diploma Marks</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Obtained:</label>
                  <input
                    type="number"
                    value={formData.interDiplomaMarks.obtained}
                    onChange={(e) => handleNestedChange("interDiplomaMarks", "obtained", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Max:</label>
                  <input
                    type="number"
                    value={formData.interDiplomaMarks.max}
                    onChange={(e) => handleNestedChange("interDiplomaMarks", "max", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Percentage:</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      value={formData.interDiplomaMarks.percentage}
                      onChange={(e) => handleNestedChange("interDiplomaMarks", "percentage", e.target.value)}
                      disabled={!isEditing && !isNewUser}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'family':
        return (
          <div className="tab-content">
            <div className="card">
              <h3>Parent Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    value={formData.parentDetails.name}
                    onChange={(e) => handleNestedChange("parentDetails", "name", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Occupation:</label>
                  <input
                    value={formData.parentDetails.occupation}
                    onChange={(e) => handleNestedChange("parentDetails", "occupation", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Address:</label>
                <input
                  value={formData.parentDetails.address}
                  onChange={(e) => handleNestedChange("parentDetails", "address", e.target.value)}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    value={formData.parentDetails.contactNumber}
                    onChange={(e) => handleNestedChange("parentDetails", "contactNumber", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    value={formData.parentDetails.email}
                    onChange={(e) => handleNestedChange("parentDetails", "email", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3>Local Guardian</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    value={formData.localGuardian.name}
                    onChange={(e) => handleNestedChange("localGuardian", "name", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input
                    value={formData.localGuardian.contactNumber}
                    onChange={(e) => handleNestedChange("localGuardian", "contactNumber", e.target.value)}
                    disabled={!isEditing && !isNewUser}
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Address:</label>
                <input
                  value={formData.localGuardian.address}
                  onChange={(e) => handleNestedChange("localGuardian", "address", e.target.value)}
                  disabled={!isEditing && !isNewUser}
                />
              </div>
            </div>
          </div>
        );
        
      case 'extra':
        return (
          <div className="tab-content">
            <div className="card">
              <h3>Hobbies</h3>
              <div className="form-group full-width">
                <label>Hobbies (comma separated):</label>
                <input
                  value={formData.hobbies.join(", ")}
                  onChange={(e) => setFormData({...formData, hobbies: e.target.value.split(",").map(item => item.trim())})}
                  disabled={!isEditing && !isNewUser}
                  placeholder="e.g. Reading, Swimming, Chess"
                />
              </div>
            </div>
            
            <div className="card">
              <h3>Extra-Curricular Activities</h3>
              <div className="form-group full-width">
                <label>Games & Activities (comma separated):</label>
                <input
                  value={formData.participation.gamesAndActivities.join(", ")}
                  onChange={(e) => handleArrayChange("participation", "gamesAndActivities", e.target.value)}
                  disabled={!isEditing && !isNewUser}
                  placeholder="e.g. Basketball, Swimming, Drama Club"
                />
              </div>
              <div className="form-group full-width">
                <label>Literary Activities (comma separated):</label>
                <input
                  value={formData.participation.literary.join(", ")}
                  onChange={(e) => handleArrayChange("participation", "literary", e.target.value)}
                  disabled={!isEditing && !isNewUser}
                  placeholder="e.g. Debate, Poetry, Creative Writing"
                />
              </div>
              <div className="form-group full-width">
                <label>Technical Activities (comma separated):</label>
                <input
                  value={formData.participation.technical.join(", ")}
                  onChange={(e) => handleArrayChange("participation", "technical", e.target.value)}
                  disabled={!isEditing && !isNewUser}
                  placeholder="e.g. Robotics, Coding, Electronics"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{isNewUser ? "Create Profile" : "Student Profile"}</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-picture-container">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            
            {(isEditing || isNewUser) && (
              <div className="profile-picture-upload">
                <label className="upload-btn">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, profilePicture: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="profile-actions">
            {!isEditing && !isNewUser ? (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Save Profile
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    if (isNewUser) {
                      setFormData({
                        ...formData,
                        email: profile?.email || ""
                      });
                    } else {
                      setFormData(profile);
                      setIsEditing(false);
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Details
            </button>
            <button 
              className={`nav-item ${activeTab === 'academic' ? 'active' : ''}`}
              onClick={() => setActiveTab('academic')}
            >
              Academic Details
            </button>
            <button 
              className={`nav-item ${activeTab === 'family' ? 'active' : ''}`}
              onClick={() => setActiveTab('family')}
            >
              Family Information
            </button>
            <button 
              className={`nav-item ${activeTab === 'extra' ? 'active' : ''}`}
              onClick={() => setActiveTab('extra')}
            >
              Extra-Curricular
            </button>
          </div>
        </div>
        
        <div className="profile-details">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;