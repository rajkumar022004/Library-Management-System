 import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBook, FaChartBar, FaCog, FaSignOutAlt, FaUsers, FaIdCard, FaFilm } from 'react-icons/fa';
import './Home.css';

function AdminHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <div className="header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>
            Chart
          </button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate('/admin-home')}>
            Back
          </button>
        </div>
        <h2>Admin Home Page</h2>
        <p>Welcome, {user?.name || 'Admin'}!</p>
      </div>

      <div className="modules-grid">
        {/* Maintenance Section */}
        <div className="module-card">
          <div className="module-header" style={{ backgroundColor: '#6c757d' }}>
            <FaCog className="module-icon" />
            <h3>Maintenance</h3>
          </div>
          <div className="module-body">
            <div className="sub-module">
              <h4><FaIdCard /> Membership</h4>
              <button onClick={() => navigate('/add-membership')} className="btn btn-sm btn-outline-primary">Add</button>
              <button onClick={() => navigate('/update-membership')} className="btn btn-sm btn-outline-secondary">Update</button>
            </div>
            <div className="sub-module">
              <h4><FaBook /> Books / <FaFilm /> Movies</h4>
              <button onClick={() => navigate('/add-book')} className="btn btn-sm btn-outline-primary">Add</button>
              <button onClick={() => navigate('/update-book')} className="btn btn-sm btn-outline-secondary">Update</button>
            </div>
            <div className="sub-module">
              <h4><FaUsers /> User Management</h4>
              <button onClick={() => navigate('/user-management')} className="btn btn-sm btn-outline-info">Manage</button>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="module-card">
          <div className="module-header" style={{ backgroundColor: '#28a745' }}>
            <FaChartBar className="module-icon" />
            <h3>Reports</h3>
          </div>
          <div className="module-body">
            <button onClick={() => navigate('/reports')} className="btn btn-success">View All Reports</button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="module-card">
          <div className="module-header" style={{ backgroundColor: '#007bff' }}>
            <FaBook className="module-icon" />
            <h3>Transactions</h3>
          </div>
          <div className="module-body">
            <button onClick={() => navigate('/book-available')} className="btn btn-sm btn-outline-primary mb-2">Book Availability</button>
            <button onClick={() => navigate('/book-issue')} className="btn btn-sm btn-outline-primary mb-2">Issue Book</button>
            <button onClick={() => navigate('/return-book')} className="btn btn-sm btn-outline-primary mb-2">Return Book</button>
            <button onClick={() => navigate('/pay-fine')} className="btn btn-sm btn-outline-warning">Pay Fine</button>
          </div>
        </div>
      </div>

      <div className="product-details">
        <h3>Product Details</h3>
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Code No From</th>
              <th>Code No To</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SC(B/M)000001</td>
              <td>SC(B/M)000004</td>
              <td>Science</td>
            </tr>
            <tr>
              <td>EC(B/M)000001</td>
              <td>EC(B/M)000004</td>
              <td>Economics</td>
            </tr>
            <tr>
              <td>FC(B/M)000001</td>
              <td>FC(B/M)000004</td>
              <td>Fiction</td>
            </tr>
            <tr>
              <td>CH(B/M)000001</td>
              <td>CH(B/M)000004</td>
              <td>Children</td>
            </tr>
            <tr>
              <td>PD(B/M)000001</td>
              <td>PD(B/M)000004</td>
              <td>Personal Development</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="logout-section">
        <button className="btn btn-danger logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Log Out
        </button>
      </div>
    </div>
  );
}

export default AdminHome;