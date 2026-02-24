const express = require('express');
const router = express.Router();
const {
  getMasterListBooks,
  getMasterListMovies,
  getMasterListMemberships,
  getActiveIssues,
  getOverdueReturns,
  getIssueRequests
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/master-books', getMasterListBooks);
router.get('/master-movies', getMasterListMovies);
router.get('/master-memberships', getMasterListMemberships);
router.get('/active-issues', getActiveIssues);
router.get('/overdue-returns', getOverdueReturns);
router.get('/issue-requests', getIssueRequests);

module.exports = router;  