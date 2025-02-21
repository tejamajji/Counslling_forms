import React from 'react';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MarksTable from './pages/MarksTable';
import CounselingForm from './pages/CounselingForm';
import MentorGrading from './pages/MentorGrading';

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? element : <Navigate to="/" />;
};

const App = () => {
  const isAuthenticated = localStorage.getItem('authToken');
  
  return (
    <>
      <Router>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
          <Route path="/counseling-form" element={<ProtectedRoute element={<CounselingForm />} />} />
          <Route path="/semester" element={<MarksTable />} />
          <Route path="/mentorgrade" element={<MentorGrading />} />

          
          {/* Add more routes here if needed */}

          
        </Routes>
       
        
        <Footer />
      </Router>
    </>
  );
};

export default App;

