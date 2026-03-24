import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch, FaBook, FaUser, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import './Transaction.css';

function BookIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(location.state?.selectedBook || null);
  const [membershipId, setMembershipId] = useState('');
  const [membership, setMembership] = useState(null);
  const [issueDate, setIssueDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  });
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state?.selectedBook) {
      setSelectedBook(location.state.selectedBook);
      setStep(isAdmin ? 2 : (membership ? 3 : 2));
    }
  }, [location.state, isAdmin, membership]);

  useEffect(() => {
    const loadMyMembership = async () => {
      if (!isAuthenticated || isAdmin) {
        return;
      }

      setMembershipLoading(true);
      try {
        const response = await api.get('/memberships/my');
        const member = response.data.membership || response.data;
        setMembership(member);
        setMembershipId(member.membershipId || '');
      } catch (error) {
        setMembership(null);
      } finally {
        setMembershipLoading(false);
      }
    };

    loadMyMembership();
  }, [isAuthenticated, isAdmin]);

  // Search books with debounce
  useEffect(() => {
    const searchBooks = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await api.get('/books/search', {
          params: { keyword: searchTerm }
        });
        const books = response.data.books || [];
        // Admin can issue only from available books; users can view/request by category even if currently issued.
        const visibleBooks = isAdmin ? books.filter((book) => book.status === 'AVAILABLE') : books;
        setSearchResults(visibleBooks);
      } catch (error) {
        toast.error('Error searching books');
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchBooks, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isAdmin]);

  const validateMembership = async () => {
    if (!isAdmin) {
      setLoading(true);
      try {
        const response = await api.get('/memberships/my');
        const member = response.data.membership || response.data;

        if (!member) {
          toast.error('No membership linked to this account');
          return false;
        }

        if (member.status !== 'ACTIVE') {
          toast.error('Membership is not active');
          return false;
        }

        if (member.endDate && new Date(member.endDate) < new Date()) {
          toast.error('Membership has expired');
          return false;
        }

        setMembership(member);
        setMembershipId(member.membershipId || '');
        setStep(3);
        return true;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'No membership linked to this account';
        toast.error(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    }

    if (!membershipId.trim()) {
      toast.error('Please enter membership ID');
      return false;
    }

    setLoading(true);
    try {
      const response = await api.get(`/memberships/membership/${membershipId}`);
      const member = response.data.membership || response.data;

      if (!member) {
        toast.error('Membership ID not found');
        return false;
      }

      if (member.status !== 'ACTIVE') {
        toast.error('Membership is not active');
        return false;
      }

      if (member.endDate && new Date(member.endDate) < new Date()) {
        toast.error('Membership has expired');
        return false;
      }

      // Check for overdue books
      try {
        const transactionsResponse = await api.get(`/transactions/member/${member.membershipId}`);
        const transactions = transactionsResponse.data.transactions || [];
        
        if (Array.isArray(transactions)) {
          const activeTransactions = transactions.filter(t => t.status === 'ACTIVE');
          
          for (const trans of activeTransactions) {
            if (new Date(trans.returnDate) < new Date()) {
              toast.error('Member has overdue books. Please return them first.');
              return false;
            }
          }
        }
      } catch (err) {
        console.log("Transaction check skipped or failed:", err);
        // We continue issuing even if transaction history fetch fails, 
        // or you can choose to block it here.
      }

      setMembership(member);
      setStep(3);
      return true;
    } catch (error) {
      console.error("Validation Error:", error);
      // Show the actual error message from the backend if available
      const errorMsg = error.response?.data?.message || 'Membership ID not found or server error';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date, type) => {
    if (type === 'issue') {
      setIssueDate(date);
      const newReturnDate = new Date(date);
      newReturnDate.setDate(date.getDate() + 15);
      setReturnDate(newReturnDate);
    } else {
      const daysDiff = Math.ceil((date - issueDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 15) {
        toast.error('Return date cannot be more than 15 days from issue date');
        return;
      }
      if (date < issueDate) {
        toast.error('Return date cannot be before issue date');
        return;
      }
      setReturnDate(date);
    }
  };

  const handleIssueBook = async () => {
    setLoading(true);
    try {
      const response = await api.post('/transactions/issue', {
        membershipId: membership.membershipId,
        bookSerialNo: selectedBook.serialNo,
        issueDate: issueDate.toISOString(),
        returnDate: returnDate.toISOString(),
        remarks
      });

      toast.success('Book issued successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book issued successfully!',
          transaction: response.data.transaction,
          book: selectedBook,
          member: membership
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestBook = async () => {
    if (!membership) {
      toast.error('Please validate your membership first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transactions/issue-request', {
        membershipId: membership.membershipId,
        requestedBookName: selectedBook.name,
        requestedBookAuthor: selectedBook.author,
        requestedBookCategory: selectedBook.category,
        remarks
      });

      toast.success('Issue request submitted successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Issue request submitted successfully! Admin will review your request.',
          transaction: response.data.transaction,
          book: selectedBook,
          member: membership
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit issue request');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    if (isAdmin && book.status !== 'AVAILABLE') {
      toast.error('Admin can issue only available books');
      return;
    }
    setSelectedBook(book);
    setStep(isAdmin ? 2 : (membership ? 3 : 2));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>
            Chart
          </button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(isAdmin ? '/admin-home' : '/user-home')}>
            Home
          </button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
        <h2>{isAdmin ? 'Issue Book' : 'Request Book Issue'}</h2>
      </div>

      <div className="transaction-content">
        {/* Step 1: Search Book */}
        {step === 1 && (
          <div className="step-container">
            <h3>
              <FaSearch /> Step 1: Search for Book
            </h3>
            
            <div className="search-section">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by book name or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              
              {searching && <div className="text-center mt-3">Searching...</div>}
              
              {searchResults.length > 0 && (
                <div className="search-results mt-4">
                  <h4>{isAdmin ? 'Available Books' : 'Matching Books'}</h4>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Book Name</th>
                          <th>Author</th>
                          <th>Serial No</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map(book => (
                          <tr key={book._id}>
                            <td>{book.name}</td>
                            <td>{book.author}</td>
                            <td>{book.serialNo}</td>
                            <td>{book.category}</td>
                            <td>{book.status}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleSelectBook(book)}
                                disabled={isAdmin && book.status !== 'AVAILABLE'}
                              >
                                {isAdmin ? 'Select' : 'Request'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {searchTerm && !searching && searchResults.length === 0 && (
                <div className="alert alert-info mt-3">
                  {isAdmin
                    ? `No available books found matching "${searchTerm}"`
                    : `No books found matching "${searchTerm}"`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Member Validation */}
        {step === 2 && selectedBook && (
          <div className="step-container">
            <h3>
              <FaUser /> Step 2: Verify Member
            </h3>
            
            <div className="selected-book-info card mb-4">
              <div className="card-body">
                <h5>Selected Book:</h5>
                <p><strong>Name:</strong> {selectedBook.name}</p>
                <p><strong>Author:</strong> {selectedBook.author}</p>
                {isAdmin && <p><strong>Serial No:</strong> {selectedBook.serialNo}</p>}
              </div>
            </div>

            <div className="member-validation">
              {isAdmin ? (
                <>
                  <label>Enter Membership ID:</label>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      value={membershipId}
                      onChange={(e) => setMembershipId(e.target.value)}
                      placeholder="e.g., MEM000001"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={validateMembership}
                      disabled={loading}
                    >
                      {loading ? 'Validating...' : 'Validate'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {membershipLoading ? (
                    <div className="alert alert-info">Loading your membership...</div>
                  ) : membership ? (
                    <div className="alert alert-success">
                      Linked Membership: <strong>{membership.membershipId}</strong>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      No membership linked to your account. Please contact admin to link your membership.
                    </div>
                  )}
                  <button
                    className="btn btn-primary mb-3"
                    onClick={validateMembership}
                    disabled={loading || membershipLoading}
                  >
                    {loading ? 'Validating...' : 'Continue'}
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back to Search
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Issue */}
        {step === 3 && membership && selectedBook && (
          <div className="step-container">
            <h3>
              <FaCheck /> Step 3: {isAdmin ? 'Confirm Book Issue' : 'Confirm Issue Request'}
            </h3>

            <div className="row">
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header bg-primary text-white">
                    Member Details
                  </div>
                  <div className="card-body">
                    <p><strong>Name:</strong> {membership.firstName} {membership.lastName}</p>
                    <p><strong>Membership ID:</strong> {membership.membershipId}</p>
                    <p><strong>Type:</strong> {membership.membershipType}</p>
                    <p><strong>Valid Till:</strong> {new Date(membership.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header bg-success text-white">
                    Book Details
                  </div>
                  <div className="card-body">
                    <p><strong>Name:</strong> {selectedBook.name}</p>
                    <p><strong>Author:</strong> {selectedBook.author}</p>
                    {isAdmin && <p><strong>Serial No:</strong> {selectedBook.serialNo}</p>}
                    {!isAdmin && <p><strong>Category:</strong> {selectedBook.category}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-header bg-info text-white">
                <FaCalendarAlt /> Issue Details
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Issue Date:</label>
                      <DatePicker
                        selected={issueDate}
                        onChange={(date) => handleDateChange(date, 'issue')}
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Return Date:</label>
                      <DatePicker
                        selected={returnDate}
                        onChange={(date) => handleDateChange(date, 'return')}
                        className="form-control"
                        dateFormat="dd/MM/yyyy"
                        minDate={issueDate}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label>Remarks (Optional):</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={isAdmin ? handleIssueBook : handleRequestBook}
                disabled={loading}
              >
                {loading ? 'Processing...' : isAdmin ? 'Confirm Issue' : 'Submit Request'}
              </button>
            </div>
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

export default BookIssue;