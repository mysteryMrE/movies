import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UseAuth } from "../contexts/AuthContext";

const Register = () => {
  const registerForm = useRef(null);
  const { registerUser, authError, setAuthError, loading, user } = UseAuth();
  
  // Initialize from sessionStorage to persist through remounts
  const [name, setName] = useState(() => sessionStorage.getItem('registerName') || '');
  const [email, setEmail] = useState(() => sessionStorage.getItem('registerEmail') || '');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Clear errors when component mounts
    return () => {
      if (setAuthError) setAuthError(null);
      setValidationError('');
    }
  }, [setAuthError]);

  // Save form data to sessionStorage
  useEffect(() => {
    if (name) sessionStorage.setItem('registerName', name);
  }, [name]);

  useEffect(() => {
    if (email) sessionStorage.setItem('registerEmail', email);
  }, [email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (password1 !== password2) {
      setValidationError("Passwords do not match!");
      return;
    }

    if (password1.length < 8) {
      setValidationError("Password must be at least 8 characters long!");
      return;
    }

    const userInfo = { name, email, password1, password2 };
    registerUser(userInfo);
    
    // Clear passwords but keep name and email
    setPassword1('');
    setPassword2('');
  };

  const handleFieldChange = (setter, sessionKey) => (e) => {
    const value = e.target.value;
    setter(value);
    
    // Clear errors when user starts typing
    if (authError && setAuthError) {
      setAuthError(null);
    }
    if (validationError) {
      setValidationError('');
    }
  };

  // Clear sessionStorage on successful registration
  useEffect(() => {
    // This will be called when component unmounts or user changes
    return () => {
      // Only clear if we're navigating away due to successful registration
      if (window.location.pathname === '/') {
        sessionStorage.removeItem('registerName');
        sessionStorage.removeItem('registerEmail');
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="login-register-container">
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '28px', fontWeight: '600' }}>
          Create Account
        </h2>
        
        {(authError || validationError) && (
          <div className="error-message">
            {validationError || authError}
          </div>
        )}

        <form ref={registerForm} onSubmit={handleSubmit}>
          <div className="form-field-wrapper">
            <label>Name</label>
            <input
              required
              type="text"
              name="name"
              value={name}
              onChange={handleFieldChange(setName, 'registerName')}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Email</label>
            <input
              required
              type="email"
              name="email"
              value={email}
              onChange={handleFieldChange(setEmail, 'registerEmail')}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Password</label>
            <input
              required
              type="password"
              name="password1"
              value={password1}
              onChange={handleFieldChange(setPassword1)}
              placeholder="Create a password (min. 8 characters)"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Confirm Password</label>
            <input
              required
              type="password"
              name="password2"
              value={password2}
              onChange={handleFieldChange(setPassword2)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-field-wrapper">
            <input 
              type="submit" 
              value={loading ? "Creating Account..." : ( user ? "Navigating" : "Register")} 
              className="btn log-button"
              disabled={loading}
            />
          </div>
        </form>

        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
