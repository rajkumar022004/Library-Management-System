import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaBook, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import './Confirmation.css';

function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, transaction, book, member, fineAmount } = location.state || {};

  useEffect(() => {
    if (!message) {
      navigate('/');
    }
  }, [message, navigate]);

  if (!message) return null;

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        
        <h2>Success!</h2>
        <p className="message">{message}</p>

        {transaction && (
          <div className="details-section">
            <h3>Transaction Details</h3>
            <p><strong>Transaction ID:</strong> {transaction.transactionId}</p>
            <p><strong>Type:</strong> {transaction.transactionType}</p>
            <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
          </div>
        )}

        {book && (
          <div className="details-section">
            <h3><FaBook /> Book Details</h3>
            <p><strong>Name:</strong> {book.name}</p>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Serial No:</strong> {book.serialNo}</p>
          </div>
        )}

        {member && (
          <div className="details-section">
            <h3><FaUser /> Member Details</h3>
            <p><strong>Name:</strong> {member.firstName} {member.lastName}</p>
            <p><strong>Membership ID:</strong> {member.membershipId}</p>
          </div>
        )}

        {fineAmount > 0 && (
          <div className="details-section fine-section">
            <h3><FaMoneyBillWave /> Fine Details</h3>
            <p className="fine-amount">Amount Paid: ₹{fineAmount}</p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;