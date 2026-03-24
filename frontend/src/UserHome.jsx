import React from 'react';
import { Link } from 'react-router-dom';

const UserHome = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">User Dashboard</h2>
      <div className="row justify-content-center">
        {/* Reports Menu */}
        <div className="col-md-5 mb-4">
          <div className="card h-100 border-success">
            <div className="card-header bg-success text-white">Reports</div>
            <div className="card-body">
              <p>View lists of books, active issues, and other reports.</p>
              <Link to="/reports" className="btn btn-outline-success w-100">View Reports</Link>
            </div>
          </div>
        </div>

        {/* Transactions Menu */}
        <div className="col-md-5 mb-4">
          <div className="card h-100 border-warning">
            <div className="card-header bg-warning text-dark">Transactions</div>
            <div className="card-body">
              <p>Handle book/movie circulation, including issue and return.</p>
              <Link to="/book-available" className="btn btn-outline-dark w-100">Go to Transactions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;