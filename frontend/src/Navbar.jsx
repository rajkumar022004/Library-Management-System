import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homeLink = user?.isAdmin ? '/admin-home' : '/user-home';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={homeLink}>
          Library System
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to={homeLink}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/book-available">Transactions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reports">Reports</Link>
            </li>
            {user?.isAdmin && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  Maintenance
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/add-membership">Add/Update Membership</Link></li>
                  <li><Link className="dropdown-item" to="/add-book">Add/Update Book/Movie</Link></li>
                  <li><Link className="dropdown-item" to="/user-management">User Management</Link></li>
                </ul>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {user && (
              <span className="navbar-text me-3">
                Welcome, {user.name} ({user.isAdmin ? 'Admin' : 'User'})
              </span>
            )}
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;