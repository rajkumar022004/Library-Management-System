const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getAvailableBooks,
  searchBooks,
  getBookBySerialNo,
  addBook,
  updateBook
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllBooks);
router.get('/available', getAvailableBooks);
router.get('/search', searchBooks);
router.get('/:serialNo', getBookBySerialNo);
router.post('/', adminOnly, addBook);
router.put('/:id', adminOnly, updateBook);

module.exports = router;  