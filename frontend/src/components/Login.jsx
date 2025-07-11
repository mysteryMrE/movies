import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UseAuth } from '../contexts/AuthContext'


const Login = () => {
  const {user, loginUser, authError, setAuthError, loading} = UseAuth()
  const navigate = useNavigate()
  
  // Initialize email from sessionStorage to persist through remounts
  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem('loginEmail') || ''
  })
  const [password, setPassword] = useState('')

  const loginForm = useRef(null)

  useEffect(() => {
    if (user){
      navigate('/')
      // Clear stored email on successful login
      sessionStorage.removeItem('loginEmail')
    }
  }, [user, navigate])

  useEffect(() => {
    // Clear error when component mounts
    return () => {
      if (setAuthError) setAuthError(null)
    }
  }, [setAuthError])

  // Save email to sessionStorage whenever it changes
  useEffect(() => {
    if (email) {
      sessionStorage.setItem('loginEmail', email)
    }
  }, [email])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login form submitted")
    
    const userInfo = {email, password}
    loginUser(userInfo)
    
    // Clear password but keep email
    setPassword('')
  }

  const handleEmailChange = (e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    // Also clear any stored error when user starts typing
    if (authError && setAuthError) {
      setAuthError(null)
    }
  }

  return (
    <div className="container">
        <div className="login-register-container">
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '28px', fontWeight: '600' }}>
            Welcome Back
          </h2>
          
          {authError && (
            <div className="error-message">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} ref={loginForm}> 

            <div className="form-field-wrapper">
                <label>Email</label>
                <input 
                  required
                  type="email" 
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  />
            </div>

            <div className="form-field-wrapper">
                <label>Password</label>
                <input 
                  required
                  type="password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  />
            </div>


            <div className="form-field-wrapper">
                <input 
                  type="submit" 
                  value={loading ? "Logging in..." : "Login"}
                  className="btn log-button"
                  disabled={loading}
                  />
            </div>

          </form>

          <div className="auth-link">
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </div>

        </div>
    </div>
  )
}

export default Login