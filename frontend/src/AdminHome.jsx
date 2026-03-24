import React from 'react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row">
        {/* Maintenance Menu */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-primary">
            <div className="card-header bg-primary text-white">Maintenance</div>
            <div className="card-body d-flex flex-column gap-2">
              <Link to="/add-membership" className="btn btn-outline-primary text-start">Add/Update Membership</Link>
              <Link to="/add-book" className="btn btn-outline-primary text-start">Add/Update Book/Movie</Link>
              <Link to="/user-management" className="btn btn-outline-primary text-start">User Management</Link>
            </div>
          </div>
        </div>

        {/* Reports Menu */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white">Reports</div>
            <div className="card-body">
              <p>View master lists, active issues, and overdue returns.</p>
              <Link to="/reports" className="btn btn-outline-success w-100">View All Reports</Link>
            </div>
          </div>
        </div>

        {/* Transactions Menu */}
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-warning">
            <div className="card-header bg-warning text-dark">Transactions</div>
            <div className="card-body">
              <p>Handle book/movie circulation, including issue, return, and fines.</p>
              <Link to="/book-available" className="btn btn-outline-dark w-100">Go to Transactions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;