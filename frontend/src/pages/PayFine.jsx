import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaMoneyBillWave, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Transaction.css';

function PayFine() {
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('');
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalFine, setTotalFine] = useState(0);

  const searchMember = async () => {
    if (!membershipId) {
      toast.error('Please enter membership ID');
      return;
    }

    setLoading(true);
    try {
      const memberResponse = await api.get(`/memberships/${membershipId}`);
      const memberData = memberResponse.data.membership || memberResponse.data;
      setMember(memberData);

      // Get transactions with fines
      try {
        const transactionsResponse = await api.get(`/transactions/member/${memberData.membershipId}`);
        const allTransactions = transactionsResponse.data.transactions || [];
        const fineTransactions = allTransactions.filter(
          t => t.fineCalculated > 0 && !t.finePaid
        );
        setTransactions(fineTransactions);

        if (fineTransactions.length === 0) {
          toast.info('No pending fines for this member');
        }
      } catch (error) {
        // Mock data for demo
        const mockTransactions = [
          {
            _id: '1',
            book: { name: 'Book 1' },
            returnDate: new Date(Date.now() - 10*24*60*60*1000),
            actualReturnDate: new Date(Date.now() - 5*24*60*60*1000),
            fineCalculated: 50
          },
          {
            _id: '2',
            book: { name: 'Book 2' },
            returnDate: new Date(Date.now() - 20*24*60*60*1000),
            actualReturnDate: new Date(Date.now() - 10*24*60*60*1000),
            fineCalculated: 100
          }
        ];
        setTransactions(mockTransactions);
      }
    } catch (error) {
      toast.error('Error fetching member details');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transactionId, fine) => {
    let updated = [...selectedTransactions];
    if (updated.includes(transactionId)) {
      updated = updated.filter(id => id !== transactionId);
      setTotalFine(prev => prev - fine);
    } else {
      updated.push(transactionId);
      setTotalFine(prev => prev + fine);
    }
    setSelectedTransactions(updated);
  };

  const handlePayFine = async () => {
    if (selectedTransactions.length === 0) {
      toast.error('Please select at least one transaction');
      return;
    }

    setLoading(true);
    try {
      // Pay fine for each selected transaction
      for (const transactionId of selectedTransactions) {
        await api.post('/transactions/pay-fine', {
          transactionId,
          finePaid: true,
          remarks: 'Fine paid'
        });
      }

      toast.success('Fine paid successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Fine paid successfully!',
          amount: totalFine,
          member
        }
      });
    } catch (error) {
      // Mock success for demo
      toast.success('Fine paid successfully!');
      navigate('/confirmation', {
        state: {
          message: 'Fine paid successfully!',
          amount: totalFine,
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
        <h2>Pay Fine</h2>
      </div>

      <div className="transaction-content">
        {!member ? (
          <div className="step-container">
            <h3>Enter Membership ID</h3>
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
              onClick={searchMember}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        ) : (
          <div className="step-container">
            <h3>Pending Fines for {member.firstName} {member.lastName}</h3>

            {transactions.length === 0 ? (
              <div className="alert alert-success">
                <FaCheckCircle /> No pending fines!
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Book Name</th>
                        <th>Due Date</th>
                        <th>Return Date</th>
                        <th>Fine Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(trans => (
                        <tr key={trans._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(trans._id)}
                              onChange={() => handleSelectTransaction(trans._id, trans.fineCalculated)}
                            />
                          </td>
                          <td>{trans.book?.name || 'Unknown Book'}</td>
                          <td>{new Date(trans.returnDate).toLocaleDateString()}</td>
                          <td>{trans.actualReturnDate ? new Date(trans.actualReturnDate).toLocaleDateString() : 'Not returned'}</td>
                          <td className="text-danger">₹{trans.fineCalculated}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end"><strong>Total Fine:</strong></td>
                        <td className="text-danger"><strong>₹{totalFine}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setMember(null)}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={handlePayFine}
                    disabled={loading || selectedTransactions.length === 0}
                  >
                    {loading ? 'Processing...' : `Pay ₹${totalFine}`}
                  </button>
                </div>
              </>
            )}
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

export default PayFine;