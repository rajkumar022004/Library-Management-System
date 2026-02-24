const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  contactName: String,
  contactAddress: String,
  aadharCardNo: {
    type: String,
    required: true,
    unique: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  membershipType: {
    type: String,
    enum: ['SIX_MONTHS', 'ONE_YEAR', 'TWO_YEARS'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'CANCELLED'],
    default: 'ACTIVE'
  },
  fineAmount: {
    type: Number,
    default: 0
  }
});


membershipSchema.pre('save', async function(next) {
  if (this.membershipId) return next();
  
  
  if (!this.endDate) {
    const durationMap = {
      'SIX_MONTHS': 180,
      'ONE_YEAR': 365,
      'TWO_YEARS': 730
    };
    const days = durationMap[this.membershipType];
    this.endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  
  
  const count = await this.constructor.countDocuments();
  this.membershipId = `MEM${String(count + 1).padStart(6, '0')}`;
  next();
});

module.exports = mongoose.model('Membership', membershipSchema);