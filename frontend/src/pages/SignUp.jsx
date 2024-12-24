import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between SignIn and SignUp

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
        // Save auth token and redirect
        localStorage.setItem('authToken', data.token);
        navigate('/');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Server error, please try again later');
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Side Image */}
      <div style={styles.imageContainer}>
        <img
          src="https://www.gvpce.ac.in/slideshow/home/Homepageslideshowphotos/2.College&Departments/18.jpg" // Replace with actual image URL
          alt="Auth Image"
          style={styles.image}
        />
      </div>

      {/* Right Side Form */}
      <div style={styles.formContainer}>
        <div style={styles.card}>
          <h2 style={styles.heading}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleSubmit} style={styles.form}>
            {isSignUp && (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                style={styles.input}
                required
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              style={styles.input}
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              style={styles.input}
              required
            />
            {isSignUp && (
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                style={styles.input}
                required
              />
            )}
            <button type="submit" style={styles.button}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>

          <p style={styles.toggleText} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  imageContainer: {
    flex: 1,
    maxWidth: '40%',
    padding: '20px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
  formContainer: {
    flex: 1,
    maxWidth: '450px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    padding: '30px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '15px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
    marginBottom: '10px',
    width: '100%',
  },
  button: {
    padding: '15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '10px',
  },
  toggleText: {
    color: '#007bff',
    cursor: 'pointer',
    marginTop: '15px',
  },
};

export default Auth;
