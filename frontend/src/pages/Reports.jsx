import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaFileAlt, FaFilm, FaIdCard, FaExclamationTriangle, FaClock, FaQuestionCircle } from 'react-icons/fa';
import './Reports.css';

function Reports() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeIssues, setActiveIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showActiveIssues, setShowActiveIssues] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [reportRows, setReportRows] = useState([]);
  const [selectedSerialByRequest, setSelectedSerialByRequest] = useState({});

  const handleApproveRequest = async (requestId) => {
    if (!requestId) {
      toast.error('Invalid request id');
      return;
    }

    setLoading(true);
    try {
      const serialNo = selectedSerialByRequest[requestId] || '';
      await api.post(`/transactions/issue-request/${requestId}/approve`, { serialNo });
      toast.success('Book issued successfully for this request');
      await loadAdminReport('Pending Issue Requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book from request');
    } finally {
      setLoading(false);
    }
  };

  const reports = useMemo(() => [
    {
      title: 'Master List of Books',
      icon: <FaFileAlt />,
      description: 'View all books in the library',
      color: '#007bff'
    },
    {
      title: 'Master List of Movies',
      icon: <FaFilm />,
      description: 'View all movies in the library',
      color: '#28a745'
    },
    {
      title: 'Master List of Memberships',
      icon: <FaIdCard />,
      description: 'View all active memberships',
      color: '#17a2b8'
    },
    {
      title: 'Active Issues',
      icon: <FaClock />,
      description: 'View currently issued items',
      color: '#ffc107'
    },
    {
      title: 'Overdue Returns',
      icon: <FaExclamationTriangle />,
      description: 'View overdue items with fine calculations',
      color: '#dc3545'
    },
    {
      title: 'Pending Issue Requests',
      icon: <FaQuestionCircle />,
      description: 'View pending issue requests from users',
      color: '#6c757d'
    }
  ], []);

  const visibleReports = useMemo(() => {
    if (isAdmin) return reports;
    return reports.filter((report) =>
      ['Master List of Books', 'Master List of Movies', 'Master List of Memberships', 'Active Issues', 'Overdue Returns', 'Pending Issue Requests'].includes(report.title)
    );
  }, [isAdmin, reports]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString();
  };

  const loadActiveIssues = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await api.get('/reports/active-issues');
        setActiveIssues(response.data.activeIssues || []);
      } else {
        const response = await api.get('/transactions/my-history');
        const txns = response.data.transactions || [];
        const mapped = txns
          .filter((t) => t.status === 'ACTIVE')
          .map((t) => ({
            serialNo: t.bookSerial,
            name: t.bookName,
            type: 'BOOK',
            membershipId: response.data.membershipInfo?.membershipId || '-',
            memberName: '-',
            issueDate: t.issueDate,
            returnDate: t.returnDate,
            fineCalculated: t.fine || 0
          }));

        setActiveIssues(mapped);
      }

      setShowActiveIssues(true);
    } catch (error) {
      setActiveIssues([]);
      toast.error(error.response?.data?.message || 'Failed to load active issues');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminReport = async (reportTitle) => {
    setLoading(true);
    try {
      if (reportTitle === 'Master List of Books') {
        const response = await api.get('/reports/master-books');
        setReportRows(response.data.books || []);
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else if (reportTitle === 'Master List of Memberships') {
        const response = await api.get('/reports/master-memberships');
        setReportRows(response.data.memberships || []);
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else if (reportTitle === 'Overdue Returns') {
        const response = await api.get('/reports/overdue-returns');
        setReportRows(response.data.overdueReturns || []);
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else if (reportTitle === 'Pending Issue Requests') {
        const response = await api.get('/reports/issue-requests');
        const rows = response.data.issueRequests || [];
        setReportRows(rows);
        setSelectedSerialByRequest(
          rows.reduce((acc, row) => {
            acc[row.transactionId] = row.autoSelectedSerialNo || '';
            return acc;
          }, {})
        );
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else if (reportTitle === 'Active Issues') {
        const response = await api.get('/reports/active-issues');
        setReportRows(response.data.activeIssues || []);
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else if (reportTitle === 'Master List of Movies') {
        const response = await api.get('/reports/master-movies');
        setReportRows(response.data.movies || []);
        setSelectedReport(reportTitle);
        setShowActiveIssues(false);
      } else {
        toast.info(`${reportTitle} will be connected in a next step.`);
      }
    } catch (error) {
      setReportRows([]);
      toast.error(error.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const renderAdminTable = () => {
    if (!selectedReport) return null;

    if (selectedReport === 'Master List of Books') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Name</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="6" className="text-center">No books found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.serialNo || index}`}>
                <td>{row.serialNo || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.author || '-'}</td>
                <td>{row.category || '-'}</td>
                <td>{row.status || '-'}</td>
                <td>{row.cost ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'Master List of Movies') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Name</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="6" className="text-center">No movies found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.serialNo || index}`}>
                <td>{row.serialNo || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.author || '-'}</td>
                <td>{row.category || '-'}</td>
                <td>{row.status || '-'}</td>
                <td>{row.cost ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'Master List of Memberships') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Membership ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="7" className="text-center">No memberships found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.membershipId || index}`}>
                <td>{row.membershipId || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.contactNumber || '-'}</td>
                <td>{row.status || '-'}</td>
                <td>{formatDate(row.startDate)}</td>
                <td>{formatDate(row.endDate)}</td>
                <td>{row.fineAmount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'Overdue Returns') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Book Serial</th>
              <th>Book Name</th>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Return Date</th>
              <th>Days Overdue</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="7" className="text-center">No overdue returns found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.serialNo || index}`}>
                <td>{row.serialNo || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.membershipId || '-'}</td>
                <td>{row.memberName || '-'}</td>
                <td>{formatDate(row.returnDate)}</td>
                <td>{row.daysOverdue || 0}</td>
                <td>{row.fineCalculated || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'Active Issues') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Book Serial</th>
              <th>Book Name</th>
              <th>Type</th>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Fine</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="8" className="text-center">No active issues found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.serialNo || index}`}>
                <td>{row.serialNo || '-'}</td>
                <td>{row.name || '-'}</td>
                <td>{row.type || '-'}</td>
                <td>{row.membershipId || '-'}</td>
                <td>{row.memberName || '-'}</td>
                <td>{formatDate(row.issueDate)}</td>
                <td>{formatDate(row.returnDate)}</td>
                <td>{row.fineCalculated || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'Pending Issue Requests') {
      return (
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Requested By</th>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Book Name</th>
              <th>Author</th>
              <th>Category</th>
              <th>Select Serial No</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.length === 0 && (
              <tr><td colSpan="11" className="text-center">No pending issue requests found.</td></tr>
            )}
            {reportRows.map((row, index) => (
              <tr key={`${row.transactionId || index}`}>
                <td>{row.transactionId || '-'}</td>
                <td>{row.requestedBy || '-'}</td>
                <td>{row.membershipId || '-'}</td>
                <td>{row.memberName || '-'}</td>
                <td>{row.requestedBookName || '-'}</td>
                <td>{row.requestedBookAuthor || '-'}</td>
                <td>{row.requestedBookCategory || '-'}</td>
                <td>
                  {row.availableSerialNos?.length ? (
                    <select
                      className="form-select form-select-sm"
                      value={selectedSerialByRequest[row.transactionId] || ''}
                      onChange={(e) => {
                        setSelectedSerialByRequest((prev) => ({
                          ...prev,
                          [row.transactionId]: e.target.value
                        }));
                      }}
                    >
                      {row.availableSerialNos.map((serial) => (
                        <option key={serial} value={serial}>{serial}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted">No serial available</span>
                  )}
                </td>
                <td>{formatDate(row.requestedDate)}</td>
                <td>{row.status || '-'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleApproveRequest(row.transactionId)}
                    disabled={
                      loading ||
                      row.status !== 'PENDING' ||
                      !(selectedSerialByRequest[row.transactionId] || '').trim()
                    }
                  >
                    Issue
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const handleReportClick = (reportTitle) => {
    if (isAdmin) {
      setShowActiveIssues(false);
      setActiveIssues([]);
      setSelectedReport('');
      setReportRows([]);
      loadAdminReport(reportTitle);
    } else if (reportTitle === 'Active Issues') {
      setSelectedReport('');
      setReportRows([]);
      loadActiveIssues();
    } else if (reportTitle === 'Master List of Books' || reportTitle === 'Master List of Movies' || reportTitle === 'Master List of Memberships' || reportTitle === 'Overdue Returns' || reportTitle === 'Pending Issue Requests') {
      setShowActiveIssues(false);
      setActiveIssues([]);
      setSelectedReport('');
      setReportRows([]);
      loadAdminReport(reportTitle);
    } else {
      toast.info('You have read-only access to Books and Movies lists.');
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
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
        <h2>Available Reports</h2>
      </div>

      <div className="reports-grid">
        {visibleReports.map((report, index) => (
          <div 
            key={index} 
            className="report-card"
            onClick={() => handleReportClick(report.title)}
            style={{ borderTop: `4px solid ${report.color}` }}
          >
            <div className="report-icon" style={{ color: report.color }}>
              {report.icon}
            </div>
            <div className="report-details">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="alert alert-info">Loading report...</div>
      )}

      {selectedReport && !loading && (
        <div className="report-panel card p-3 mb-4">
          <h4 className="mb-3">{selectedReport}</h4>
          <div className="table-responsive">
            {renderAdminTable()}
          </div>
        </div>
      )}

      {showActiveIssues && (
        <div className="report-panel card p-3">
          <h4 className="mb-3">Active Issue Section</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Book Serial</th>
                  <th>Book Name</th>
                  <th>Type</th>
                  <th>Membership ID</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {activeIssues.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No active issues found.
                    </td>
                  </tr>
                )}
                {activeIssues.map((issue, index) => (
                  <tr key={`${issue.serialNo || 'book'}-${index}`}>
                    <td>{issue.serialNo || '-'}</td>
                    <td>{issue.name || '-'}</td>
                    <td>{issue.type || '-'}</td>
                    <td>{issue.membershipId || '-'}</td>
                    <td>{formatDate(issue.issueDate)}</td>
                    <td>{formatDate(issue.returnDate)}</td>
                    <td>{issue.fineCalculated || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="reports-footer">
        <button className="btn btn-link" onClick={() => navigate('/logout')}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Reports;