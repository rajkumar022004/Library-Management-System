const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  getMembershipById,
  getMembershipByMembershipId,
  addMembership,
  updateMembership,
  extendMembership,
  deleteMembership,
  searchMemberships
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', adminOnly, getAllMemberships);
router.get('/search', searchMemberships);
router.get('/:id', getMembershipById);
router.get('/membership/:membershipId', getMembershipByMembershipId);
router.post('/', adminOnly, addMembership);
router.put('/:id', adminOnly, updateMembership);
router.put('/:id/extend', protect, extendMembership);
router.delete('/:id', adminOnly, deleteMembership);

module.exports = router;  