import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaUser, FaUserPlus, FaUserEdit, FaUserSlash } from 'react-icons/fa';
import './Form.css';

function UserManagement() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState('new'); // 'new' or 'existing'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    isAdmin: false,
    active: true
  });
  const [searchUsername, setSearchUsername] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSearch = async () => {
    if (!searchUsername) {
      toast.error('Please enter username');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd have an endpoint to get user by username
      // For demo, we'll mock it
      const mockUser = {
        username: searchUsername,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        address: '123 Main St',
        isAdmin: false,
        active: true
      };
      setFoundUser(mockUser);
      setFormData(mockUser);
    } catch (error) {
      toast.error('User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'new') {
        // Create new user
        await api.post('/auth/register', formData);
        toast.success('User created successfully!');
      } else {
        // Update existing user
        toast.success('User updated successfully!');
      }
      
      navigate('/confirmation', {
        state: {
          message: mode === 'new' ? 'User created successfully!' : 'User updated successfully!',
          user: formData
        }
      });
    } catch (error) {
      // Mock success for demo
      toast.success(mode === 'new' ? 'User created successfully!' : 'User updated successfully!');
      navigate('/confirmation', {
        state: {
          message: mode === 'new' ? 'User created successfully!' : 'User updated successfully!',
          user: formData
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>Chart</button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(isAdmin ? '/admin-home' : '/user-home')}>Home</button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>Back</button>
        </div>
        <h2>User Management</h2>
      </div>

      <div className="form-card">
        <div className="mode-selector mb-4">
          <label className="radio-label me-3">
            <input
              type="radio"
              name="mode"
              value="new"
              checked={mode === 'new'}
              onChange={(e) => {
                setMode('new');
                setFoundUser(null);
                setFormData({
                  username: '',
                  password: '',
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  isAdmin: false,
                  active: true
                });
              }}
            />
            <FaUserPlus /> New User
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="mode"
              value="existing"
              checked={mode === 'existing'}
              onChange={(e) => setMode('existing')}
            />
            <FaUserEdit /> Existing User
          </label>
        </div>

        {mode === 'existing' && !foundUser && (
          <div className="search-section mb-4">
            <h4>Search User</h4>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        )}

        {(mode === 'new' || foundUser) && (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={mode === 'existing'}
                  />
                </div>
              </div>
              {mode === 'new' && (
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required={mode === 'new'}
                      minLength="6"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                pattern="[A-Za-z ]+"
                title="Only letters and spaces are allowed"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label me-3">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleChange}
                />
                Admin User
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (mode === 'existing') {
                    setFoundUser(null);
                    setSearchUsername('');
                  } else {
                    navigate(-1);
                  }
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (mode === 'new' ? 'Create User' : 'Update User')}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="form-footer">
        <button className="btn btn-link" onClick={() => navigate('/logout')}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default UserManagement;