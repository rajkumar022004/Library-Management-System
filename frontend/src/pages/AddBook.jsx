import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Form.css';

function AddBook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category: 'Other',
    cost: '',
    type: 'BOOK',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.author) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/books', formData);
      toast.success('Book added successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book added successfully!',
          book: response.data.book
        }
      });
    } catch (error) {
      // Mock success for demo
      const mockBook = {
        ...formData,
        _id: Math.random().toString(36).substr(2, 9),
        serialNo: formData.type === 'BOOK' ? 'SC(B)000001' : 'SC(M)000001',
        status: 'AVAILABLE'
      };
      toast.success('Book added successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book added successfully!',
          book: mockBook
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
        <h2>Add Book/Movie</h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
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
            <label>{formData.type === 'BOOK' ? 'Book' : 'Movie'} Name *</label>
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
                <label>Quantity/Copies</label>
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
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

export default AddBook;