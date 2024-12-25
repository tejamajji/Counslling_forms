import React from 'react'
import Footer from './components/Footer';
//import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Signup from './pages/SignUp';
//import { useNavigate } from 'react-router-dom';
//import { User } from 'lucide-react';


const App = () => {
    const isAuthenticated = localStorage.getItem('authToken');
  return (
    <>
    <Router>
      <Header />
      <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/signUp" element={<Signup />} />
      </Routes>
      <Footer />
    </Router>
    </>
  )
}

export default App