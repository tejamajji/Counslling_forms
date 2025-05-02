import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ 
    name: '', 
    email: '', 
    profilePicture: '',
    role: ''
  });
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [mentorGradings, setMentorGradings] = useState([]);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const authToken = localStorage.getItem('authToken');
    
      if (!authToken) {
        console.log('No auth token found. Redirecting to /signup');
        navigate('/signup');
        return;
      }
    
      try {
        // Fetch user details from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
    
        console.log("Fetched Email from localStorage:", userEmail);
        console.log("Fetched Username from localStorage:", userName);
        console.log("Fetched Role from localStorage:", userRole);
    
        // Update the user state with localStorage data
        setUser({
          name: userName || 'User',
          email: userEmail || 'Not Available',
          profilePicture: '',
          role: userRole || 'user'
        });
    
        // Fetch additional details from the backend
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
    
        console.log('User Details from Backend:', response.data);
    
        // Update the user state with backend data
        setUser((prevUser) => ({
          ...prevUser,
          name: response.data.username || prevUser.name,
          email: response.data.email || prevUser.email,
          profilePicture: response.data.profilePicture || prevUser.profilePicture,
          role: response.data.role || prevUser.role
        }));
    
        console.log('Updated User State:', user);
      } catch (error) {
        console.error('Error fetching user details:', error);
        if (error.response?.status === 401) {
          navigate('/signup');
        }
      }
    };
    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      try {
        // Fetch data with proper authentication
        const [usersRes, profilesRes, mentorGradingsRes, marksRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/profiles', config),
          axios.get('http://localhost:5000/api/admin/mentorgradings', config),
          axios.get('http://localhost:5000/api/admin/marks', config)
        ]);
        
        // Store data in state
        setUsers(usersRes.data);
        setProfiles(profilesRes.data);
        setMentorGradings(mentorGradingsRes.data);
        setMarks(marksRes.data);
      } catch (err) {
        // Handle errors appropriately
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/signup');
  };

  return (
    <div style={styles.container}>
      {/* Left Profile Card */}
      <div style={styles.profileCard}>
        <div
          style={{
            ...styles.profileImage,
            backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <h2 style={styles.bigText}>Hello, {user.name}!</h2>
        <p style={styles.smallText}>{user.email}</p>
        <div style={styles.stats}>
          <p><strong>⭐ Projects:</strong> 12</p>
          <p><strong>🎯 Achievements:</strong> 5</p>
          <p><strong>📅 Joined:</strong> Jan 2024</p>
        </div>
      </div>

      {/* Right Content Section */}
      <div style={styles.content}>
        <h1 style={styles.heading}>Welcome to your Dashboard</h1>
        <p style={styles.subHeading}>One place to manage your profile, track progress, and explore more.</p>
        <p style={styles.description}>
          Customize your experience, stay updated, and unlock exclusive features tailored for you.
        </p>
        <div style={styles.buttonGroup}>
          <button onClick={handleLogout} style={styles.button}>Log Out</button>
          <button onClick={() => navigate('/profile')} style={styles.buttonSecondary}>My Profile</button>
          <button onClick={() => navigate('/semester')} style={styles.buttonTertiary}>Semester Marks</button>
          <button onClick={() => navigate('/mentorgrade')} style={{
            ...styles.button,
            backgroundColor: '#4CAF50',
          }}>Mentor Grading</button>
          
          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')} style={{
              ...styles.button,
              backgroundColor: '#9c27b0',
              boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
            }}>
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Background Decorations */}
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    width: '100%',
    height: '80vh',
    backgroundColor: '#f8f9fa',
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    padding: '20px',
  },
  profileCard: {
    width: '320px',
    background: 'linear-gradient(135deg, #007bff, #ff007f, #ff8c00)',
    borderRadius: '20px',
    padding: '35px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
    color: '#fff',
    textAlign: 'center',
  },
  profileImage: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: '#d3d3d3',
    marginBottom: '15px',
  },
  bigText: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  smallText: {
    fontSize: '14px',
    opacity: '0.9',
    marginBottom: '15px',
  },
  stats: {
    fontSize: '16px',
    lineHeight: '1.6',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '60px',
  },
  heading: {
    fontSize: '55px',
    fontWeight: 'bold',
    color: '#222',
    marginBottom: '10px',
  },
  subHeading: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#444',
    marginBottom: '15px',
  },
  description: {
    fontSize: '18px',
    color: '#555',
    maxWidth: '550px',
    marginBottom: '30px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    padding: '14px 28px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.3)',
  },
  buttonSecondary: {
    padding: '14px 28px',
    backgroundColor: '#ff007f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(255, 0, 127, 0.3)',
  },
  buttonTertiary: {
    padding: '14px 28px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: '0.3s ease-in-out',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
  },
  circleOne: {
    position: 'absolute',
    top: '8%',
    right: '12%',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d4ff, #008cff)',
    opacity: '0.3',
    animation: 'float 4s infinite alternate',
  },
  circleTwo: {
    position: 'absolute',
    bottom: '8%',
    left: '5%',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff8c00, #ff007f)',
    opacity: '0.4',
    animation: 'float 5s infinite alternate',
  },
};

export default Dashboard;