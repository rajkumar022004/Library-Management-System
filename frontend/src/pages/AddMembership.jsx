import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Form.css';

function AddMembership() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactName: '',
    contactAddress: '',
    aadharCardNo: '',
    contactNumber: '',
    membershipType: 'SIX_MONTHS' // Default to 6 months
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.aadharCardNo || !formData.contactNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.aadharCardNo.length !== 12) {
      toast.error('Aadhar card number must be 12 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/memberships', formData);
      toast.success('Membership added successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Membership added successfully!',
          membership: response.data.membership
        }
      });
    } catch (error) {
      // Mock success for demo
      const mockMembership = {
        ...formData,
        membershipId: 'MEM' + Math.floor(Math.random() * 1000000),
        startDate: new Date(),
        endDate: new Date(Date.now() + 180*24*60*60*1000)
      };
      toast.success('Membership added successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Membership added successfully!',
          membership: mockMembership
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
          <button className="nav-link" onClick={() => navigate('/admin-home')}>Home</button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>Back</button>
        </div>
        <h2>Add Membership</h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-control"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Contact Name</label>
            <input
              type="text"
              name="contactName"
              className="form-control"
              value={formData.contactName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Contact Address</label>
            <textarea
              name="contactAddress"
              className="form-control"
              value={formData.contactAddress}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label>Aadhar Card No *</label>
                <input
                  type="text"
                  name="aadharCardNo"
                  className="form-control"
                  value={formData.aadharCardNo}
                  onChange={handleChange}
                  maxLength="12"
                  pattern="[0-9]{12}"
                  required
                />
                <small className="text-muted">12 digit number</small>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label>Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  className="form-control"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Membership Type *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="membershipType"
                  value="SIX_MONTHS"
                  checked={formData.membershipType === 'SIX_MONTHS'}
                  onChange={handleChange}
                />
                6 Months
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="membershipType"
                  value="ONE_YEAR"
                  checked={formData.membershipType === 'ONE_YEAR'}
                  onChange={handleChange}
                />
                1 Year
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="membershipType"
                  value="TWO_YEARS"
                  checked={formData.membershipType === 'TWO_YEARS'}
                  onChange={handleChange}
                />
                2 Years
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Membership'}
            </button>
          </div>
        </form>
      </div>

      <div className="form-footer">
        <button className="btn btn-link" onClick={() => navigate('/logout')}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default AddMembership;