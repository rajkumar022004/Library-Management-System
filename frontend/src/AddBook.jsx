import React, { useState } from 'react';
import { toast } from 'react-toastify';

const AddBook = () => {
  const [type, setType] = useState('Book'); // Default to Book
  const [formData, setFormData] = useState({
    name: '',
    serialNo: '',
    author: '',
    status: 'Available',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (!formData[key]) {
        toast.error("All fields are mandatory.");
        return;
      }
    }
    toast.success(`${type} added successfully!`);
  };

  return (
    <div className="container mt-4">
      <h2>Add Book/Movie</h2>
      
      <form onSubmit={handleSubmit} className="mt-4 border p-4 rounded shadow-sm">
        <div className="mb-4">
          <label className="fw-bold me-3">Type:</label>
          <div className="form-check form-check-inline">
            <input 
              className="form-check-input" 
              type="radio" 
              id="radioBook" 
              value="Book" 
              checked={type === 'Book'} 
              onChange={() => setType('Book')} 
            />
            <label className="form-check-label" htmlFor="radioBook">Book</label>
          </div>
          <div className="form-check form-check-inline">
            <input 
              className="form-check-input" 
              type="radio" 
              id="radioMovie" 
              value="Movie" 
              checked={type === 'Movie'} 
              onChange={() => setType('Movie')} 
            />
            <label className="form-check-label" htmlFor="radioMovie">Movie</label>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">{type} Name <span className="text-danger">*</span></label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Serial No <span className="text-danger">*</span></label>
            <input type="text" name="serialNo" className="form-control" value={formData.serialNo} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Author/Director <span className="text-danger">*</span></label>
            <input type="text" name="author" className="form-control" value={formData.author} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Date <span className="text-danger">*</span></label>
            <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">Add {type}</button>
      </form>
    </div>
  );
};

export default AddBook;