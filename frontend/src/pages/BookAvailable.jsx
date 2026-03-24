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
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAvailableBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, books]);

  const normalizeBooks = (payload) => {
    if (Array.isArray(payload?.books)) {
      return payload.books;
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    return [];
  };

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books/available');
      const availableBooks = normalizeBooks(response.data);
      setBooks(availableBooks);
      setFilteredBooks([]);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(availableBooks.map(book => book.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      setBooks([]);
      setFilteredBooks([]);
      setCategories(['All']);
      toast.error(error.response?.data?.message || 'Error fetching books');
    } finally {
      setLoading(false);
    }
  };

  const applyCategoryFilter = (bookList) => {
    if (selectedCategory === 'All') {
      return bookList;
    }
    return bookList.filter((book) => book.category === selectedCategory);
  };

  const searchAvailableBooks = async () => {
    const keyword = searchTerm.trim();

    if (!keyword) {
      setFilteredBooks([]);
      return;
    }

    setSearching(true);
    try {
      const response = await api.get('/books/search', {
        params: { keyword }
      });

      const searchedBooks = normalizeBooks(response.data);
      const onlyAvailable = searchedBooks.filter((book) => book.status === 'AVAILABLE');
      setFilteredBooks(applyCategoryFilter(onlyAvailable));
    } catch (error) {
      // Fallback to local filtering if API search fails.
      const localResults = (Array.isArray(books) ? books : []).filter((book) =>
        book.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        book.author?.toLowerCase().includes(keyword.toLowerCase()) ||
        book.serialNo?.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredBooks(applyCategoryFilter(localResults));
      toast.error(error.response?.data?.message || 'Error searching books');
    } finally {
      setSearching(false);
    }
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

        {searching && (
          <div className="text-center mb-3">Searching books...</div>
        )}

        {!searchTerm.trim() ? (
          <div className="alert alert-info">
            Search for a book by name, author, or serial number.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="alert alert-info">
            {searchTerm.trim()
              ? `No available books found for "${searchTerm}".`
              : 'No books available at the moment.'}
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
                  <tr key={book._id || book.serialNo}>
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