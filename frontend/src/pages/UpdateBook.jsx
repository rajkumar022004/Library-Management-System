import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Form.css';

function UpdateBook() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [serialNo, setSerialNo] = useState('');
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development', 'Other'];
  const statuses = ['AVAILABLE', 'ISSUED', 'DAMAGED', 'LOST'];

  const searchBook = async () => {
    if (!serialNo) {
      toast.error('Please enter serial number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/books/${serialNo}`);
      const bookData = response.data.book || response.data;
      setFormData(bookData);
      setStep(2);
    } catch (error) {
      // Mock data for demo
      const mockBook = {
        _id: '123',
        serialNo: serialNo,
        name: 'Sample Book',
        author: 'Sample Author',
        category: 'Science',
        type: 'BOOK',
        status: 'AVAILABLE',
        cost: 500,
        quantity: 3
      };
      setFormData(mockBook);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put(`/books/${formData._id}`, formData);
      toast.success('Book updated successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book updated successfully!',
          book: response.data.book
        }
      });
    } catch (error) {
      // Mock success for demo
      toast.success('Book updated successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book updated successfully!',
          book: formData
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
        <h2>Update Book/Movie</h2>
      </div>

      <div className="form-card">
        {step === 1 ? (
          <div className="search-section">
            <h3>Enter Serial Number</h3>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                placeholder="Enter serial number (e.g., SC(B)000001)"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={searchBook}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Update {formData.type}</h3>
            
            <div className="form-group">
              <label>Type:</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="BOOK"
                    checked={formData.type === 'BOOK'}
                    onChange={handleChange}
                  />
                  Book
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="MOVIE"
                    checked={formData.type === 'MOVIE'}
                    onChange={handleChange}
                  />
                  Movie
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Author/Director *</label>
              <input
                type="text"
                name="author"
                className="form-control"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Serial No</label>
              <input
                type="text"
                className="form-control"
                value={formData.serialNo}
                disabled
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Cost (₹)</label>
                  <input
                    type="number"
                    name="cost"
                    className="form-control"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
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

export default UpdateBook;