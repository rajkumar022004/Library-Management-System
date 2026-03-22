import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaUserAlt, FaUserShield, FaIdBadge, FaEnvelope } from 'react-icons/fa';
import './Login.css';

function Login() {
  const [role, setRole] = useState('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username,
        password,
        name,
        email,
        isAdmin: false
      });
      toast.success('Account created. Please sign in.');
      setIsSignUp(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setIsSignUp(false);
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Library Management System</h2>
          <p>
            {isSignUp
              ? 'Create a user account'
              : role === 'admin'
              ? 'Admin login'
              : 'User login'}
          </p>
        </div>

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => switchRole('user')}
          >
            <FaUserAlt className="tab-icon" /> User
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => switchRole('admin')}
          >
            <FaUserShield className="tab-icon" /> Admin
          </button>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSubmit}>
          {isSignUp && role === 'user' && (
            <>
              <div className="form-group">
                <label>
                  <FaIdBadge className="icon" /> Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FaEnvelope className="icon" /> Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              <FaUser className="icon" /> Username
            </label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock className="icon" /> Password
            </label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading
              ? isSignUp
                ? 'Creating Account...'
                : 'Signing In...'
              : isSignUp
              ? 'Sign Up'
              : 'Sign In'}
          </button>
        </form>

        {role === 'user' && (
          <div className="toggle-mode">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span className="toggle-link" onClick={toggleMode}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
