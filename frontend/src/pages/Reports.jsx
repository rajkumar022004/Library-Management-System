import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFileAlt, FaFilm, FaIdCard, FaExclamationTriangle, FaClock, FaQuestionCircle } from 'react-icons/fa';
import './Reports.css';

function Reports() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const reports = [
    {
      title: 'Master List of Books',
      icon: <FaFileAlt />,
      description: 'View all books in the library',
      color: '#007bff'
    },
    {
      title: 'Master List of Movies',
      icon: <FaFilm />,
      description: 'View all movies in the library',
      color: '#28a745'
    },
    {
      title: 'Master List of Memberships',
      icon: <FaIdCard />,
      description: 'View all active memberships',
      color: '#17a2b8'
    },
    {
      title: 'Active Issues',
      icon: <FaClock />,
      description: 'View currently issued items',
      color: '#ffc107'
    },
    {
      title: 'Overdue Returns',
      icon: <FaExclamationTriangle />,
      description: 'View overdue items with fine calculations',
      color: '#dc3545'
    },
    {
      title: 'Pending Issue Requests',
      icon: <FaQuestionCircle />,
      description: 'View pending issue requests',
      color: '#6c757d'
    }
  ];

  // In a real app, these would navigate to specific report pages
  // For now, they'll just show a message
  const handleReportClick = (reportTitle) => {
    alert(`Showing ${reportTitle} - This feature will be implemented with actual data from the backend.`);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>
            Chart
          </button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(isAdmin ? '/admin-home' : '/user-home')}>
            Home
          </button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
        <h2>Available Reports</h2>
      </div>

      <div className="reports-grid">
        {reports.map((report, index) => (
          <div 
            key={index} 
            className="report-card"
            onClick={() => handleReportClick(report.title)}
            style={{ borderTop: `4px solid ${report.color}` }}
          >
            <div className="report-icon" style={{ color: report.color }}>
              {report.icon}
            </div>
            <div className="report-details">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="reports-footer">
        <button className="btn btn-link" onClick={() => navigate('/logout')}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Reports;