import React from 'react'
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

const App = () => {
    const isAuthenticated = localStorage.getItem('authToken');
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <Footer />
    </Router>
    </>
  )
}

export default App