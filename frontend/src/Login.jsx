import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = login(userId, password);
    if (user) {
      toast.success(`Welcome, ${user.name}!`);
      navigate(user.isAdmin ? '/admin-home' : '/user-home');
    } else {
      toast.error('Invalid credentials. Use admin/admin or user/user.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="card shadow-lg" style={{ width: '400px' }}>
        <div className="card-header text-center h4">Login</div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">User ID</label>
              <input
                type="text"
                className="form-control"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">Login</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setUserId(''); setPassword(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;