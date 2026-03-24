const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const mongoose = require('mongoose');

// @desc    Issue a book
// @route   POST /api/transactions/issue
exports.issueBook = async (req, res) => {
  try {
    const { membershipId, bookSerialNo, issueDate, returnDate, remarks } = req.body;

    // Validate membership
    const membership = await Membership.findOne({ membershipId });
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (membership.status !== 'ACTIVE') {
      throw new Error('Membership is not active');
    }

    if (membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new Error('Membership has expired');
    }

    if (!membership.user) {
      throw new Error('Membership is not linked to any user. Please link membership to a user first.');
    }

    // Check if member has overdue books
    const activeTransactions = await Transaction.find({
      membership: membership._id,
      status: 'ACTIVE'
    });

    for (const trans of activeTransactions) {
      // Calculate fine for each
      const today = new Date();
      const returnDate = new Date(trans.returnDate);
      if (today > returnDate) {
        throw new Error('Member has overdue books. Please return them first.');
      }
    }

    // Validate book
    const book = await Book.findOne({ serialNo: bookSerialNo });
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.status !== 'AVAILABLE') {
      throw new Error('Book is not available');
    }

    // Check if member already has this book
    const existingIssue = await Transaction.findOne({
      membership: membership._id,
      book: book._id,
      status: 'ACTIVE'
    });

    if (existingIssue) {
      throw new Error('Member already has this book issued');
    }

    // Validate dates
    const issueDateObj = issueDate ? new Date(issueDate) : new Date();
    let returnDateObj = returnDate ? new Date(returnDate) : 
      new Date(issueDateObj.getTime() + (15 * 24 * 60 * 60 * 1000));

    // Check if return date is within 15 days
    const daysDiff = Math.ceil((returnDateObj - issueDateObj) / (1000 * 60 * 60 * 24));
    if (daysDiff > 15) {
      throw new Error('Return date cannot be more than 15 days from issue date');
    }

    if (returnDateObj < issueDateObj) {
      throw new Error('Return date cannot be before issue date');
    }

    // Create transaction
    const transaction = new Transaction({
      membership: membership._id,
      user: membership.user,
      book: book._id,
      transactionType: 'ISSUE',
      issueDate: issueDateObj,
      returnDate: returnDateObj,
      remarks,
      status: 'ACTIVE'
    });

    await transaction.save();

    // Update book status
    book.status = 'ISSUED';
    await book.save();

    // Populate and return
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('membership')
      .populate('book');

    res.json({
      success: true,
      message: 'Book issued successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create an issue request (typically by user)
// @route   POST /api/transactions/issue-request
exports.requestIssue = async (req, res) => {
  try {
    const {
      membershipId,
      bookSerialNo,
      requestedBookName,
      requestedBookAuthor,
      requestedBookCategory,
      remarks
    } = req.body;

    if (!membershipId) {
      throw new Error('Membership ID is required');
    }

    const membership = await Membership.findOne({ membershipId: String(membershipId).trim() });
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (membership.status !== 'ACTIVE') {
      throw new Error('Membership is not active');
    }

    if (membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new Error('Membership has expired');
    }

    if (!membership.user) {
      membership.user = req.user.userId;
      await membership.save();
    } else if (String(membership.user) !== String(req.user.userId) && !req.user.isAdmin) {
      throw new Error('This membership does not belong to your account');
    }

    let normalizedName = String(requestedBookName || '').trim();
    let normalizedAuthor = String(requestedBookAuthor || '').trim();
    let normalizedCategory = String(requestedBookCategory || '').trim();

    if (bookSerialNo) {
      const book = await Book.findOne({ serialNo: String(bookSerialNo).trim() });
      if (!book) {
        throw new Error('Book not found');
      }
      normalizedName = book.name;
      normalizedAuthor = book.author;
      normalizedCategory = book.category;
    }

    if (!normalizedName) {
      throw new Error('Requested book name is required');
    }

    const requestedBookFilter = {
      name: normalizedName,
      author: normalizedAuthor,
      category: normalizedCategory,
      status: { $nin: ['LOST', 'DAMAGED'] }
    };

    const matchableBooksCount = await Book.countDocuments(requestedBookFilter);
    if (matchableBooksCount === 0) {
      throw new Error('No matching book record found for this request');
    }

    const existingOpenRequest = await Transaction.findOne({
      membership: membership._id,
      requestedBookName: normalizedName,
      requestedBookAuthor: normalizedAuthor,
      requestedBookCategory: normalizedCategory,
      status: 'PENDING'
    });

    if (existingOpenRequest) {
      throw new Error('There is already a pending request for this book');
    }

    const issueDate = new Date();
    const returnDate = new Date(issueDate.getTime() + (15 * 24 * 60 * 60 * 1000));

    const transaction = new Transaction({
      membership: membership._id,
      requestedBy: req.user.userId,
      requestedBookName: normalizedName,
      requestedBookAuthor: normalizedAuthor,
      requestedBookCategory: normalizedCategory,
      transactionType: 'ISSUE',
      issueDate,
      returnDate,
      remarks,
      status: 'PENDING'
    });

    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('membership')
      .populate('book')
      .populate('requestedBy', 'username name');

    res.status(201).json({
      success: true,
      message: 'Issue request submitted successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a pending issue request
// @route   POST /api/transactions/issue-request/:transactionId/approve
exports.approveIssueRequest = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { serialNo } = req.body;

    const requestTxn = await Transaction.findOne({
      transactionId,
      transactionType: 'ISSUE',
      status: 'PENDING'
    });

    if (!requestTxn) {
      throw new Error('Pending issue request not found');
    }

    const membership = await Membership.findById(requestTxn.membership);
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (membership.status !== 'ACTIVE') {
      throw new Error('Membership is not active');
    }

    if (membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new Error('Membership has expired');
    }

    const requestedName = requestTxn.requestedBookName;
    const requestedAuthor = requestTxn.requestedBookAuthor;
    const requestedCategory = requestTxn.requestedBookCategory;

    let book;
    if (serialNo) {
      book = await Book.findOne({ serialNo: String(serialNo).trim() });
      if (!book) {
        throw new Error('Selected serial number not found');
      }
      if (book.status !== 'AVAILABLE') {
        throw new Error('Selected serial number is not available');
      }
    } else {
      const autoFilter = {
        status: 'AVAILABLE',
        name: requestedName,
        author: requestedAuthor,
        category: requestedCategory
      };
      book = await Book.findOne(autoFilter).sort({ serialNo: 1 });
    }

    if (!book && requestTxn.book) {
      const fallbackBook = await Book.findById(requestTxn.book);
      if (fallbackBook && fallbackBook.status === 'AVAILABLE') {
        book = fallbackBook;
      }
    }

    if (!book) {
      throw new Error('No available serial number found for this requested book');
    }

    const today = new Date();
    const activeTransactions = await Transaction.find({
      membership: membership._id,
      status: 'ACTIVE'
    });

    for (const trans of activeTransactions) {
      const dueDate = new Date(trans.returnDate);
      if (today > dueDate) {
        throw new Error('Member has overdue books. Please return them first.');
      }
    }

    requestTxn.issueDate = today;
    requestTxn.returnDate = new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000));
    requestTxn.book = book._id;
    requestTxn.user = membership.user;
    requestTxn.status = 'ACTIVE';
    requestTxn.remarks = requestTxn.remarks
      ? `${requestTxn.remarks} | Approved by admin`
      : 'Approved by admin';

    await requestTxn.save();

    book.status = 'ISSUED';
    await book.save();

    const populatedTransaction = await Transaction.findById(requestTxn._id)
      .populate('membership')
      .populate('book')
      .populate('requestedBy', 'username name');

    res.json({
      success: true,
      message: 'Issue request approved and book issued successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Return a book
// @route   POST /api/transactions/return
exports.returnBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { membershipId, bookSerialNo, actualReturnDate, remarks } = req.body;

    const membership = await Membership.findOne({ membershipId }).session(session);
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (!req.user.isAdmin) {
      if (!membership.user || String(membership.user) !== String(req.user.userId)) {
        throw new Error('Not authorized to return books for this membership');
      }
    }

    const book = await Book.findOne({ serialNo: bookSerialNo }).session(session);
    if (!book) {
      throw new Error('Book not found');
    }

    const transaction = await Transaction.findOne({
      membership: membership._id,
      book: book._id,
      status: 'ACTIVE'
    }).session(session);

    if (!transaction) {
      throw new Error('No active transaction found for this book');
    }

    // Set return date
    transaction.actualReturnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
    
    // Calculate fine
    const FINE_PER_DAY = 10;
    const returnDate = new Date(transaction.returnDate);
    const actualReturn = new Date(transaction.actualReturnDate);
    
    if (actualReturn > returnDate) {
      const daysOverdue = Math.ceil((actualReturn - returnDate) / (1000 * 60 * 60 * 24));
      transaction.fineCalculated = daysOverdue * FINE_PER_DAY;
    }
    
    transaction.status = 'COMPLETED';
    transaction.remarks = remarks || transaction.remarks;
    transaction.transactionType = 'RETURN';

    await transaction.save({ session });

    // Update book status
    book.status = 'AVAILABLE';
    await book.save({ session });

    // Update membership fine if any
    if (transaction.fineCalculated > 0) {
      membership.fineAmount = (membership.fineAmount || 0) + transaction.fineCalculated;
      await membership.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('membership')
      .populate('book');

    res.json({
      success: true,
      message: 'Book returned successfully',
      transaction: populatedTransaction,
      fineAmount: transaction.fineCalculated
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Pay fine
// @route   POST /api/transactions/pay-fine
exports.payFine = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId, finePaid, remarks } = req.body;

    const transaction = await Transaction.findById(transactionId).session(session);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!req.user.isAdmin) {
      const membership = await Membership.findById(transaction.membership).session(session);
      if (!membership || !membership.user || String(membership.user) !== String(req.user.userId)) {
        throw new Error('Not authorized to pay fine for this transaction');
      }
    }

    if (transaction.fineCalculated > 0 && !transaction.finePaid) {
      transaction.finePaid = finePaid;
      transaction.remarks = remarks || transaction.remarks;
      
      // Update membership fine amount
      if (finePaid) {
        const membership = await Membership.findById(transaction.membership).session(session);
        if (membership) {
          membership.fineAmount = Math.max(0, (membership.fineAmount || 0) - transaction.fineCalculated);
          await membership.save({ session });
        }
      }
    }

    await transaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: 'Fine payment processed',
      transaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get overdue returns
// @route   GET /api/transactions/overdue
exports.getOverdueReturns = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: 'ACTIVE',
      returnDate: { $lt: new Date() }
    })
    .populate('membership')
    .populate('book');

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get member transactions
// @route   GET /api/transactions/member/:membershipId
exports.getMemberTransactions = async (req, res) => {
  try {
    const membership = await Membership.findOne({ membershipId: req.params.membershipId });
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    if (!req.user.isAdmin) {
      if (!membership.user || String(membership.user) !== String(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this membership transactions'
        });
      }
    }

    const transactions = await Transaction.find({ membership: membership._id })
      .populate('book')
      .sort('-createdAt');

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check book availability
// @route   GET /api/transactions/check-availability/:serialNo
exports.checkAvailability = async (req, res) => {
  try {
    const book = await Book.findOne({ serialNo: req.params.serialNo });
    
    res.json({
      success: true,
      available: book ? book.status === 'AVAILABLE' : false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get logged-in user's transactions
// @route   GET /api/transactions/my-history
exports.getMyTransactions = async (req, res) => {
  try {
    // Prefer explicit membership mapping first.
    let membership = await Membership.findOne({ user: req.user.userId });
    let transactionFilter;

    if (membership) {
      transactionFilter = { membership: membership._id };
    } else {
      // Fallback for legacy data: identify user's records by ownership fields.
      const ownedRows = await Transaction.find({
        $or: [
          { user: req.user.userId },
          { requestedBy: req.user.userId }
        ]
      }).select('membership');

      const membershipIds = [
        ...new Set(
          ownedRows
            .map((row) => row.membership?.toString())
            .filter(Boolean)
        )
      ];

      if (membershipIds.length === 1) {
        const inferredMembership = await Membership.findById(membershipIds[0]);
        if (inferredMembership) {
          // Auto-link only if membership is currently unassigned.
          if (!inferredMembership.user) {
            inferredMembership.user = req.user.userId;
            await inferredMembership.save();
          }
          membership = inferredMembership;
          transactionFilter = { membership: inferredMembership._id };
        }
      }

      if (!transactionFilter) {
        transactionFilter = {
          $or: [
            { user: req.user.userId },
            { requestedBy: req.user.userId }
          ]
        };
      }
    }

    const transactions = await Transaction.find(transactionFilter)
      .populate('book', 'name serialNo author')
      .sort('-createdAt');

    // Calculate current status for display
    const data = transactions.map(t => {
      let displayFine = t.fineCalculated;
      const today = new Date();
      const rDate = new Date(t.returnDate);

      // If active and overdue, calculate prospective fine
      if (t.status === 'ACTIVE' && today > rDate) {
        const days = Math.ceil((today - rDate) / (1000 * 60 * 60 * 24));
        displayFine = days * 10; // 10 per day
      }

      return {
        _id: t._id,
        bookName: t.book?.name || '-',
        bookSerial: t.book?.serialNo || '-',
        bookAuthor: t.book?.author || '-',
        issueDate: t.issueDate,
        returnDate: t.returnDate,
        actualReturnDate: t.actualReturnDate,
        status: t.status,
        fine: displayFine
      };
    });

    res.json({
      success: true,
      transactions: data,
      membershipInfo: membership || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};