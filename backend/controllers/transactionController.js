const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const mongoose = require('mongoose');

// @desc    Issue a book
// @route   POST /api/transactions/issue
exports.issueBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { membershipId, bookSerialNo, issueDate, returnDate, remarks } = req.body;

    // Validate membership
    const membership = await Membership.findOne({ membershipId }).session(session);
    if (!membership) {
      throw new Error('Membership not found');
    }

    if (membership.status !== 'ACTIVE') {
      throw new Error('Membership is not active');
    }

    if (membership.endDate && new Date(membership.endDate) < new Date()) {
      throw new Error('Membership has expired');
    }

    // Check if member has overdue books
    const activeTransactions = await Transaction.find({
      membership: membership._id,
      status: 'ACTIVE'
    }).session(session);

    for (const trans of activeTransactions) {
      // Calculate fine for each
      const today = new Date();
      const returnDate = new Date(trans.returnDate);
      if (today > returnDate) {
        throw new Error('Member has overdue books. Please return them first.');
      }
    }

    // Validate book
    const book = await Book.findOne({ serialNo: bookSerialNo }).session(session);
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
    }).session(session);

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
      book: book._id,
      transactionType: 'ISSUE',
      issueDate: issueDateObj,
      returnDate: returnDateObj,
      remarks,
      status: 'ACTIVE'
    });

    await transaction.save({ session });

    // Update book status
    book.status = 'ISSUED';
    await book.save({ session });

    await session.commitTransaction();
    session.endSession();

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
    await session.abortTransaction();
    session.endSession();
    
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