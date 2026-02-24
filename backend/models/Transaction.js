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
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
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
    enum: ['ACTIVE', 'COMPLETED', 'OVERDUE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
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