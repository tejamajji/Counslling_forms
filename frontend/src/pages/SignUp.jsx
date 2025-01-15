import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/SignUp.css'; // Import CSS file

const Auth = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/18.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/19.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/20.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/21.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/22.jpg",
    "https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/23.jpg",
    // Add more images here
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  },);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const url = `${process.env.REACT_APP_API_URL}/api/auth/${isSignUp ? 'signup' : 'signin'}`;
      const body = {
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', data.role); // Store the user's role
        if (data.role === 'admin') {
          navigate('/admin-landing');
        } else {
          navigate('/user-landing');
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error, please try again later');
    }
  };

  return (
    <div className="container">
      <div className="imageContainer">
        <img
          src={images[currentImage]}
          alt="Slideshow"
          className="image"
        />
      </div>

      <div className="formContainer">
        <div className="card">
          <h2 className="heading">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="form">
            {isSignUp && (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="input"
                required
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="input"
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input"
              required
            />
            {isSignUp && (
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="input"
                required
              />
            )}
            <button type="submit" className="button">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>

          <p className="toggleText" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
