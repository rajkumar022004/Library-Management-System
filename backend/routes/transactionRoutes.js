const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  payFine,
  getOverdueReturns,
  getMemberTransactions,
  checkAvailability
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/issue', issueBook);
router.post('/return', returnBook);
router.post('/pay-fine', payFine);
router.get('/overdue', getOverdueReturns);
router.get('/member/:membershipId', getMemberTransactions);
router.get('/check-availability/:serialNo', checkAvailability);

module.exports = router;  