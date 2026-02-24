import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaSearch, FaBook, FaFilter } from 'react-icons/fa';
import './Transaction.css';

function BookAvailable() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, selectedCategory, books]);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books/available');
      const availableBooks = response.data.books || response.data;
      setBooks(availableBooks);
      setFilteredBooks(availableBooks);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(availableBooks.map(book => book.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Error fetching books');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(book => 
        book.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.serialNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    setFilteredBooks(filtered);
  };

  const handleIssueBook = (book) => {
    navigate('/book-issue', { state: { selectedBook: book } });
  };

  if (loading) {
    return <div className="loading-spinner">Loading books...</div>;
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>Chart</button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>Back</button>
        </div>
        <h2>Book Availability</h2>
      </div>

      <div className="transaction-content">
        <div className="filters-section mb-4">
          <div className="row">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text"><FaSearch /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by book name, author, or serial no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><FaFilter /></span>
                <select
                  className="form-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="alert alert-info">
            No books available at the moment.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Book Name</th>
                  <th>Author</th>
                  <th>Serial Number</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book._id}>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.serialNo}</td>
                    <td>{book.category || 'N/A'}</td>
                    <td>
                      <span className="badge bg-success">Yes</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleIssueBook(book)}
                      >
                        Issue Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="transaction-footer">
        <button className="btn btn-link" onClick={() => navigate('/logout')}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default BookAvailable;