import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Chart.css';

function Chart() {
  const navigate = useNavigate();

  const modules = [
    {
      name: 'Authentication',
      items: [
        { name: 'Admin Login', path: '/login' },
        { name: 'User Login', path: '/login' }
      ]
    },
    {
      name: 'Home',
      items: [
        { name: 'Admin Home', path: '/admin-home' },
        { name: 'User Home', path: '/user-home' }
      ]
    },
    {
      name: 'Transactions',
      items: [
        { name: 'Book Availability', path: '/book-available' },
        { name: 'Issue Book', path: '/book-issue' },
        { name: 'Return Book', path: '/return-book' },
        { name: 'Pay Fine', path: '/pay-fine' }
      ]
    },
    {
      name: 'Maintenance (Admin Only)',
      items: [
        { name: 'Add Membership', path: '/add-membership' },
        { name: 'Update Membership', path: '/update-membership' },
        { name: 'Add Book', path: '/add-book' },
        { name: 'Update Book', path: '/update-book' },
        { name: 'User Management', path: '/user-management' }
      ]
    },
    {
      name: 'Reports',
      items: [
        { name: 'Master List - Books', path: '/reports' },
        { name: 'Master List - Movies', path: '/reports' },
        { name: 'Master List - Memberships', path: '/reports' },
        { name: 'Active Issues', path: '/reports' },
        { name: 'Overdue Returns', path: '/reports' },
        { name: 'Issue Requests', path: '/reports' }
      ]
    }
  ];

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Library Management System - Navigation Chart</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="chart-grid">
        {modules.map((module, index) => (
          <div key={index} className="chart-module">
            <h3>{module.name}</h3>
            <ul>
              {module.items.map((item, idx) => (
                <li key={idx}>
                  <button
                    className="chart-link"
                    onClick={() => navigate(item.path)}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="chart-info">
        <h4>Information:</h4>
        <p>✓ 2 types of login: Admin and User</p>
        <p>✓ User - access to Reports and Transactions only</p>
        <p>✓ Admin - access to Maintenance, Reports, and Transactions</p>
        <p className="mt-3">
          <small>
            The chart shows all available pages in the Library Management System.
            Click any link to navigate to that page.
          </small>
        </p>
      </div>
    </div>
  );
}

export default Chart;