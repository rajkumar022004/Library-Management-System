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
    let filter = { status: 'ACTIVE' };

    if (!req.user.isAdmin) {
      const membership = await Membership.findOne({ user: req.user.userId });
      if (!membership) {
        return res.json({
          success: true,
          activeIssues: []
        });
      }
      filter.membership = membership._id;
    }

    const activeIssues = await Transaction.find(filter)
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
    
    let filter = {
      status: 'ACTIVE',
      returnDate: { $lt: today }
    };

    // If non-admin, filter to user's membership only
    if (!req.user.isAdmin) {
      const membership = await Membership.findOne({ user: req.user.userId });
      if (!membership) {
        return res.json({
          success: true,
          overdueReturns: []
        });
      }
      filter.membership = membership._id;
    }

    const overdueIssues = await Transaction.find(filter)
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

// @desc    Get pending issue requests created by users
// @route   GET /api/reports/issue-requests
exports.getIssueRequests = async (req, res) => {
  try {
    let filter = {
      status: 'PENDING',
      transactionType: 'ISSUE'
    };

    // If non-admin, filter to user's pending requests only
    if (!req.user.isAdmin) {
      filter.requestedBy = req.user.userId;
    }

    const pendingRequests = await Transaction.find(filter)
    .populate({
      path: 'membership',
      select: 'membershipId firstName lastName'
    })
    .populate({
      path: 'book',
      select: 'serialNo name author category type'
    })
    .populate({
      path: 'requestedBy',
      select: 'username name'
    })
    .sort('-createdAt');

    const mappedRequests = await Promise.all(
      pendingRequests.map(async (t) => {
        const requestedBookName = t.requestedBookName || t.book?.name;
        const requestedBookAuthor = t.requestedBookAuthor || t.book?.author;
        const requestedBookCategory = t.requestedBookCategory || t.book?.category;

        const availableFilter = {
          status: 'AVAILABLE',
          name: requestedBookName,
          author: requestedBookAuthor,
          category: requestedBookCategory
        };

        const availableBooks = await Book.find(availableFilter)
          .select('serialNo')
          .sort({ serialNo: 1 });

        const availableSerialNos = availableBooks.map((b) => b.serialNo);

        return {
          transactionId: t.transactionId,
          membershipId: t.membership?.membershipId,
          memberName: t.membership ? `${t.membership.firstName} ${t.membership.lastName}` : 'N/A',
          requestedBy: t.requestedBy?.name || t.requestedBy?.username || 'N/A',
          requestedBookName,
          requestedBookAuthor,
          requestedBookCategory,
          requestedDate: t.createdAt,
          remarks: t.remarks,
          status: t.status,
          availableSerialNos,
          autoSelectedSerialNo: availableSerialNos[0] || null
        };
      })
    );

    res.json({
      success: true,
      issueRequests: mappedRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};