const mongoose = require('mongoose');

const NAME_PATTERN = /^[A-Za-z ]+$/;

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
    required: true,
    trim: true,
    match: [NAME_PATTERN, 'First name can contain only letters and spaces']
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    match: [NAME_PATTERN, 'Last name can contain only letters and spaces']
  },
  contactName: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (!value) {
          return true;
        }
        return NAME_PATTERN.test(value);
      },
      message: 'Contact name can contain only letters and spaces'
    }
  },
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

// One user can be linked to at most one membership.
membershipSchema.index({ user: 1 }, { unique: true, sparse: true });


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