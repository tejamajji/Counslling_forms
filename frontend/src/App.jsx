import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import LandingPage from './pages/UserLandingPage.jsx';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MarksTable from './pages/MarksTable';
import CounselingForm from './pages/CounselingForm';
import AdminLandingPage from './pages/AdminLandingPage';
import UserLandingPage from './pages/UserLandingPage';

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
          <Route path="/admin-landing" element={<ProtectedRoute element={<AdminLandingPage />} />} />
          <Route path="/user-landing" element={<ProtectedRoute element={<UserLandingPage />} />} />
          
          {/* Add more routes here if needed */}
          
        </Routes>
        <MarksTable />
        <Footer />
      </Router>
    </>
  );
};

export default App;
