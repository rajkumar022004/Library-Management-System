const Book = require('../models/Book');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');

// @desc    Get master list of books
// @route   GET /api/reports/master-books
exports.getMasterListBooks = async (req, res) => {
  try {
    const books = await Book.find({ type: 'BOOK' }).sort({ serialNo: 1 });
    
    res.json({
      success: true,
      books: books.map(book => ({
        serialNo: book.serialNo,
        name: book.name,
        author: book.author,
        category: book.category,
        status: book.status,
        cost: book.cost,
        procurementDate: book.procurementDate
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get master list of movies
// @route   GET /api/reports/master-movies
exports.getMasterListMovies = async (req, res) => {
  try {
    const movies = await Book.find({ type: 'MOVIE' }).sort({ serialNo: 1 });
    
    res.json({
      success: true,
      movies: movies.map(movie => ({
        serialNo: movie.serialNo,
        name: movie.name,
        author: movie.author,
        category: movie.category,
        status: movie.status,
        cost: movie.cost,
        procurementDate: movie.procurementDate
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get master list of memberships
// @route   GET /api/reports/master-memberships
exports.getMasterListMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().populate('user').sort({ membershipId: 1 });
    
    res.json({
      success: true,
      memberships: memberships.map(mem => ({
        membershipId: mem.membershipId,
        name: `${mem.firstName} ${mem.lastName}`,
        contactNumber: mem.contactNumber,
        contactAddress: mem.contactAddress,
        aadharCardNo: mem.aadharCardNo,
        startDate: mem.startDate,
        endDate: mem.endDate,
        status: mem.status,
        fineAmount: mem.fineAmount || 0
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active issues
// @route   GET /api/reports/active-issues
exports.getActiveIssues = async (req, res) => {
  try {
    const activeIssues = await Transaction.find({ 
      status: 'ACTIVE' 
    })
    .populate({
      path: 'membership',
      select: 'membershipId firstName lastName contactNumber'
    })
    .populate({
      path: 'book',
      select: 'serialNo name author type'
    })
    .sort('-issueDate');

    res.json({
      success: true,
      activeIssues: activeIssues.map(issue => ({
        serialNo: issue.book?.serialNo,
        name: issue.book?.name,
        type: issue.book?.type,
        membershipId: issue.membership?.membershipId,
        memberName: issue.membership ? `${issue.membership.firstName} ${issue.membership.lastName}` : 'N/A',
        issueDate: issue.issueDate,
        returnDate: issue.returnDate,
        fineCalculated: issue.fineCalculated
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get overdue returns
// @route   GET /api/reports/overdue-returns
exports.getOverdueReturns = async (req, res) => {
  try {
    const today = new Date();
    const overdueIssues = await Transaction.find({ 
      status: 'ACTIVE',
      returnDate: { $lt: today }
    })
    .populate({
      path: 'membership',
      select: 'membershipId firstName lastName contactNumber fineAmount'
    })
    .populate({
      path: 'book',
      select: 'serialNo name author'
    })
    .sort('returnDate');

    // Calculate fines for each
    const FINE_PER_DAY = 10;
    const overdueWithFine = overdueIssues.map(issue => {
      const daysOverdue = Math.ceil((today - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * FINE_PER_DAY;
      
      return {
        serialNo: issue.book?.serialNo,
        name: issue.book?.name,
        membershipId: issue.membership?.membershipId,
        memberName: issue.membership ? `${issue.membership.firstName} ${issue.membership.lastName}` : 'N/A',
        issueDate: issue.issueDate,
        returnDate: issue.returnDate,
        daysOverdue,
        fineCalculated: fine
      };
    });

    res.json({
      success: true,
      overdueReturns: overdueWithFine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get issue requests (transactions in last 30 days)
// @route   GET /api/reports/issue-requests
exports.getIssueRequests = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
    .populate({
      path: 'membership',
      select: 'membershipId firstName lastName'
    })
    .populate({
      path: 'book',
      select: 'serialNo name type'
    })
    .sort('-createdAt');

    res.json({
      success: true,
      issueRequests: recentTransactions.map(t => ({
        membershipId: t.membership?.membershipId,
        memberName: t.membership ? `${t.membership.firstName} ${t.membership.lastName}` : 'N/A',
        bookName: t.book?.name,
        bookSerialNo: t.book?.serialNo,
        type: t.book?.type,
        requestedDate: t.createdAt,
        fulfilledDate: t.actualReturnDate,
        status: t.status,
        transactionType: t.transactionType
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};