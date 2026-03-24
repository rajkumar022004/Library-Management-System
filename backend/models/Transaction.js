const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true
  },
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestedBookName: {
    type: String,
    trim: true
  },
  requestedBookAuthor: {
    type: String,
    trim: true
  },
  requestedBookCategory: {
    type: String,
    trim: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: function() {
      return this.status !== 'PENDING';
    }
  },
  transactionType: {
    type: String,
    enum: ['ISSUE', 'RETURN', 'FINE_PAYMENT'],
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: Date,
  fineCalculated: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  remarks: String,
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'OVERDUE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

transactionSchema.index({ membership: 1, status: 1 });
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ membership: 1, book: 1, status: 1 });

transactionSchema.pre('validate', async function(next) {
  if (!this.membership) {
    return next();
  }

  try {
    const MembershipModel = mongoose.model('Membership');
    const membership = await MembershipModel.findById(this.membership).select('user');

    if (!membership) {
      return next(new Error('Membership reference is invalid'));
    }

    if (membership.user) {
      if (this.user && String(this.user) !== String(membership.user)) {
        return next(new Error('Transaction user must match membership user'));
      }
      this.user = membership.user;
    }

    return next();
  } catch (error) {
    return next(error);
  }
});


transactionSchema.pre('save', async function(next) {
  if (this.transactionId) return next();
  
  const count = await this.constructor.countDocuments();
  this.transactionId = `TXN${String(count + 1).padStart(8, '0')}`;
  next();
});

 
transactionSchema.methods.calculateFine = function() {
  const FINE_PER_DAY = 10;
  
  const today = new Date();
  const returnDate = new Date(this.returnDate);
  
  if (!this.actualReturnDate && today > returnDate) {
  
    const daysOverdue = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24));
    this.fineCalculated = daysOverdue * FINE_PER_DAY;
    this.status = 'OVERDUE';
  } else if (this.actualReturnDate) {
    const actualReturn = new Date(this.actualReturnDate);
    if (actualReturn > returnDate) {
      
      const daysOverdue = Math.ceil((actualReturn - returnDate) / (1000 * 60 * 60 * 24));
      this.fineCalculated = daysOverdue * FINE_PER_DAY;
    }
  }
  
  return this.fineCalculated;
};

module.exports = mongoose.model('Transaction', transactionSchema);