import React, { useState } from 'react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [userType, setUserType] = useState('New'); // Default to New
  const [formData, setFormData] = useState({
    name: '',
    active: true,
    admin: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Name is a mandatory field.');
      return;
    }
    toast.success(`User ${userType === 'New' ? 'created' : 'updated'} successfully.`);
  };

  return (
    <div className="container mt-4">
      <h2>User Management</h2>
      <form onSubmit={handleSubmit} className="mt-4 border p-4 rounded shadow-sm">
        <div className="mb-4">
          <label className="fw-bold me-3">User Type:</label>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="userType"
              id="radioNewUser"
              value="New"
              checked={userType === 'New'}
              onChange={() => setUserType('New')}
            />
            <label className="form-check-label" htmlFor="radioNewUser">New User</label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="userType"
              id="radioExistingUser"
              value="Existing"
              checked={userType === 'Existing'}
              onChange={() => setUserType('Existing')}
            />
            <label className="form-check-label" htmlFor="radioExistingUser">Existing User</label>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name <span className="text-danger">*</span></label>
          <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="active" name="active" checked={formData.active} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="active">
            Active (Checked = Yes/Active, Unchecked = No/Inactive)
          </label>
        </div>

        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="admin" name="admin" checked={formData.admin} onChange={handleInputChange} />
          <label className="form-check-label" htmlFor="admin">
            Admin (Checked = Grants Admin privileges)
          </label>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Confirm</button>
      </form>
    </div>
  );
};

export default UserManagement;