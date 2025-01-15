import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
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
  return isAuthenticated ? element : <Navigate to="/signup" />;
};

const App = () => {
  const isAuthenticated = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  return (
    <>
      <Router>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignUp />} />
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute element={isAuthenticated ? (userRole === 'admin' ? <AdminLandingPage /> : <UserLandingPage />) : <SignUp />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
          <Route path="/counseling-form" element={<ProtectedRoute element={<CounselingForm />} />} />

          <Route path="/admin-landing" element={<ProtectedRoute element={<AdminLandingPage />} />} />
          <Route path="/user-landing" element={<ProtectedRoute element={<UserLandingPage />} />} />

          <Route path="/semester" element={<MarksTable />} />
          
          {/* Add more routes here if needed */}
          
        </Routes>

        <MarksTable />

        <Footer />
      </Router>
    </>
  );
};

export default App;
