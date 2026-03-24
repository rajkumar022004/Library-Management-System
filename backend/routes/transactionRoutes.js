const express = require('express');
const router = express.Router();
const {
  issueBook,
  requestIssue,
  approveIssueRequest,
  returnBook,
  payFine,
  getOverdueReturns,
  getMemberTransactions,
  checkAvailability,
  getMyTransactions
} = require('../controllers/transactionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/issue', adminOnly, issueBook);
router.post('/issue-request', requestIssue);
router.post('/issue-request/:transactionId/approve', adminOnly, approveIssueRequest);
router.post('/return', returnBook);
router.post('/pay-fine', payFine);
router.get('/overdue', adminOnly, getOverdueReturns);
router.get('/member/:membershipId', getMemberTransactions);
router.get('/my-history', getMyTransactions);
router.get('/check-availability/:serialNo', checkAvailability);

module.exports = router;  