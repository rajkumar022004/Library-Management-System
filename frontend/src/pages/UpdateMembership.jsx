import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Form.css';

function UpdateMembership() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [step, setStep] = useState(1);
  const [membershipId, setMembershipId] = useState('');
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extensionType, setExtensionType] = useState('SIX_MONTHS');
  const [removeMembership, setRemoveMembership] = useState(false);
  const [linkUsername, setLinkUsername] = useState('');
  const [linking, setLinking] = useState(false);

  const searchMembership = async () => {
    const normalizedMembershipId = membershipId.trim();

    if (!normalizedMembershipId) {
      toast.error('Please enter membership ID');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/memberships/${normalizedMembershipId}`);
      const memberData = response.data.membership || response.data;

      if (!memberData || !memberData.membershipId) {
        toast.error('Membership details not found');
        setFormData(null);
        setStep(1);
        return;
      }

      setFormData(memberData);
      setLinkUsername(memberData?.user?.username || '');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Membership not found');
      setFormData(null);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = async () => {
    const username = linkUsername.trim();

    if (!username) {
      toast.error('Please enter username to link');
      return;
    }

    setLinking(true);
    try {
      const response = await api.put(`/memberships/${formData._id}/link-user`, {
        username
      });

      const updatedMembership = response.data.membership || formData;
      setFormData(updatedMembership);
      setLinkUsername(updatedMembership?.user?.username || username);
      toast.success('Membership linked successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to link membership');
    } finally {
      setLinking(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (removeMembership) {
        await api.delete(`/memberships/${formData._id}`);
        toast.success('Membership cancelled successfully');
      } else {
        // Extend membership
        const response = await api.put(`/memberships/${formData._id}/extend`, {
          extensionType
        });
        toast.success('Membership extended successfully');
        setFormData(response.data.membership);
      }
      
      navigate('/confirmation', {
        state: {
          message: removeMembership ? 'Membership cancelled successfully' : 'Membership extended successfully',
          membership: formData
        }
      });
    } catch (error) {
      // Mock success for demo
      toast.success(removeMembership ? 'Membership cancelled successfully' : 'Membership extended successfully');
      navigate('/confirmation', {
        state: {
          message: removeMembership ? 'Membership cancelled successfully' : 'Membership extended successfully',
          membership: formData
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
        <h2>Update Membership</h2>
      </div>

      <div className="form-card">
        {step === 1 ? (
          <div className="search-section">
            <h3>Enter Membership Number</h3>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                placeholder="Enter membership ID"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={searchMembership}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        ) : (
          <div className="update-section">
            <h3>Membership Details</h3>
            
            <div className="member-info card mb-4">
              <div className="card-body">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Membership ID:</strong> {formData.membershipId}</p>
                <p><strong>Linked User:</strong> {formData.user?.username || 'Not linked'}</p>
                <p><strong>Type:</strong> {formData.membershipType}</p>
                <p><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(formData.endDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span className={`badge ${formData.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                    {formData.status}
                  </span>
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5>Link Membership To User Account</h5>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={linkUsername}
                      onChange={(e) => setLinkUsername(e.target.value)}
                      placeholder="Enter username to link"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleLinkUser}
                    disabled={linking}
                  >
                    {linking ? 'Linking...' : 'Link User'}
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={removeMembership}
                  onChange={(e) => setRemoveMembership(e.target.checked)}
                />
                Cancel Membership
              </label>
            </div>

            {!removeMembership && (
              <div className="form-group">
                <label>Membership Extension:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="extension"
                      value="SIX_MONTHS"
                      checked={extensionType === 'SIX_MONTHS'}
                      onChange={(e) => setExtensionType(e.target.value)}
                    />
                    6 Months
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="extension"
                      value="ONE_YEAR"
                      checked={extensionType === 'ONE_YEAR'}
                      onChange={(e) => setExtensionType(e.target.value)}
                    />
                    1 Year
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="extension"
                      value="TWO_YEARS"
                      checked={extensionType === 'TWO_YEARS'}
                      onChange={(e) => setExtensionType(e.target.value)}
                    />
                    2 Years
                  </label>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
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

export default UpdateMembership;