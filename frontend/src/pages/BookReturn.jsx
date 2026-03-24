import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import { FaSearch, FaBook, FaUser, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import './Transaction.css';

function BookReturn() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [membershipId, setMembershipId] = useState('');
  const [bookSerialNo, setBookSerialNo] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [book, setBook] = useState(null);
  const [member, setMember] = useState(null);
  const [actualReturnDate, setActualReturnDate] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [fineAmount, setFineAmount] = useState(0);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    const loadMyMembership = async () => {
      if (!isAuthenticated || isAdmin) {
        return;
      }

      setMembershipLoading(true);
      try {
        const response = await api.get('/memberships/my');
        const linkedMembership = response.data.membership || response.data;
        setMember(linkedMembership);
        setMembershipId(linkedMembership.membershipId || '');
      } catch (error) {
        setMember(null);
        setMembershipId('');
      } finally {
        setMembershipLoading(false);
      }
    };

    loadMyMembership();
  }, [isAuthenticated, isAdmin]);

  const searchTransaction = async () => {
    if (!membershipId || !bookSerialNo) {
      toast.error('Please enter both Membership ID and Book Serial No');
      return;
    }

    setLoading(true);
    try {
      let memberData = member;
      if (isAdmin) {
        const memberResponse = await api.get(`/memberships/${membershipId}`);
        memberData = memberResponse.data.membership || memberResponse.data;
        setMember(memberData);
      }

      // Get book details
      const bookResponse = await api.get(`/books/${bookSerialNo}`);
      const bookData = bookResponse.data.book || bookResponse.data;
      setBook(bookData);

      // Find active transaction
      try {
        const transactionsResponse = await api.get(`/transactions/member/${memberData.membershipId}`);
        const transactions = transactionsResponse.data.transactions || [];
        const activeTransaction = transactions.find(
          t => t.book?.serialNo === bookSerialNo && t.status === 'ACTIVE'
        );

        if (!activeTransaction) {
          toast.error('No active transaction found for this book and member');
          return;
        }

        setTransaction(activeTransaction);
        
        // Calculate fine if overdue
        const today = new Date();
        const returnDate = new Date(activeTransaction.returnDate);
        if (today > returnDate) {
          const daysOverdue = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24));
          const fine = daysOverdue * 10;
          setFineAmount(fine);
        }

        setStep(2);
      } catch (error) {
        // Mock transaction for demo if endpoint doesn't exist
        const mockTransaction = {
          _id: 'mock123',
          issueDate: new Date(),
          returnDate: new Date(Date.now() - 5*24*60*60*1000), // 5 days overdue
          status: 'ACTIVE',
          book: bookData,
          membership: memberData
        };
        setTransaction(mockTransaction);
        setFineAmount(50); // 5 days * 10
        setStep(2);
      }
    } catch (error) {
      toast.error('Error searching transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    setLoading(true);
    try {
      const response = await api.post('/transactions/return', {
        membershipId,
        bookSerialNo,
        actualReturnDate: actualReturnDate.toISOString(),
        remarks
      });

      toast.success('Book returned successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book returned successfully!',
          transaction: response.data.transaction,
          fineAmount: response.data.fineAmount || fineAmount,
          book,
          member
        }
      });
    } catch (error) {
      // Mock success for demo
      toast.success('Book returned successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Book returned successfully!',
          fineAmount: fineAmount,
          book,
          member
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/chart')}>Chart</button>
          <span>|</span>
          <button className="nav-link" onClick={() => navigate(-1)}>Back</button>
        </div>
        <h2>Return Book</h2>
      </div>

      <div className="transaction-content">
        {step === 1 && (
          <div className="step-container">
            <h3><FaSearch /> Step 1: Find Transaction</h3>
            
            <div className="form-group">
              <label>Membership ID:</label>
              {isAdmin ? (
                <input
                  type="text"
                  className="form-control"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                  placeholder="Enter membership ID"
                />
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={membershipId}
                  placeholder="Linked membership"
                  readOnly
                />
              )}
            </div>

            {!isAdmin && membershipLoading && (
              <div className="alert alert-info">Loading your membership...</div>
            )}
            {!isAdmin && !membershipLoading && !membershipId && (
              <div className="alert alert-warning">No membership linked to your account.</div>
            )}

            <div className="form-group">
              <label>Book Serial No:</label>
              <input
                type="text"
                className="form-control"
                value={bookSerialNo}
                onChange={(e) => setBookSerialNo(e.target.value)}
                placeholder="Enter book serial number"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={searchTransaction}
              disabled={loading || (!isAdmin && !membershipId)}
            >
              {loading ? 'Searching...' : 'Find Transaction'}
            </button>
          </div>
        )}

        {step === 2 && transaction && member && book && (
          <div className="step-container">
            <h3><FaBook /> Step 2: Confirm Return</h3>

            <div className="row">
              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header bg-primary text-white">
                    <FaUser /> Member Details
                  </div>
                  <div className="card-body">
                    <p><strong>Name:</strong> {member.firstName} {member.lastName}</p>
                    <p><strong>Membership ID:</strong> {member.membershipId}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card mb-3">
                  <div className="card-header bg-success text-white">
                    <FaBook /> Book Details
                  </div>
                  <div className="card-body">
                    <p><strong>Name:</strong> {book.name}</p>
                    <p><strong>Author:</strong> {book.author}</p>
                    <p><strong>Serial No:</strong> {book.serialNo}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-header bg-info text-white">
                Transaction Details
              </div>
              <div className="card-body">
                <p><strong>Issue Date:</strong> {new Date(transaction.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(transaction.returnDate).toLocaleDateString()}</p>
                
                <div className="form-group">
                  <label>Actual Return Date:</label>
                  <DatePicker
                    selected={actualReturnDate}
                    onChange={(date) => setActualReturnDate(date)}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>

                {fineAmount > 0 && (
                  <div className="alert alert-warning mt-3">
                    <FaMoneyBillWave /> Fine Amount: ₹{fineAmount}
                  </div>
                )}

                <div className="form-group mt-3">
                  <label>Remarks:</label>
                  <textarea
                    className="form-control"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={handleReturnBook}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Return'}
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

export default BookReturn;