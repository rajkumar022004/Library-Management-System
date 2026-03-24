const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  getMembershipById,
  getMembershipByMembershipId,
  getMyMembership,
  addMembership,
  updateMembership,
  linkMembershipToUser,
  extendMembership,
  deleteMembership,
  searchMemberships
} = require('../controllers/membershipController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', adminOnly, getAllMemberships);
router.get('/my', getMyMembership);
router.get('/search', searchMemberships);
router.get('/membership/:membershipId', getMembershipByMembershipId);
router.get('/:id', getMembershipById);
router.post('/', adminOnly, addMembership);
router.put('/:id', adminOnly, updateMembership);
router.put('/:id/link-user', adminOnly, linkMembershipToUser);
router.put('/:id/extend', protect, extendMembership);
router.delete('/:id', adminOnly, deleteMembership);

module.exports = router;  