const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  serialNo: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development', 'Other'],
    default: 'Other'
  },
  cost: {
    type: Number,
    min: 0
  },
  procurementDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ISSUED', 'DAMAGED', 'LOST'],
    default: 'AVAILABLE'
  },
  type: {
    type: String,
    enum: ['BOOK', 'MOVIE'],
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  availableCopies: {
    type: Number,
    default: 1
  }
});

bookSchema.pre('save', async function(next) {
  if (this.serialNo) return next();
  
  const prefix = this.type === 'BOOK' ? 'B' : 'M';
  const categoryCode = this.category.substring(0, 2).toUpperCase();
  
  
  const lastBook = await this.constructor.findOne({
    serialNo: new RegExp(`^${categoryCode}\\(${prefix}\\)`)
  }).sort({ serialNo: -1 });
  
  let nextNum = 1;
  if (lastBook && lastBook.serialNo) {
    const numPart = lastBook.serialNo.slice(-6);
    nextNum = parseInt(numPart) + 1;
  }
  
  this.serialNo = `${categoryCode}(${prefix})${String(nextNum).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('Book', bookSchema);