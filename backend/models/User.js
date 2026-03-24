const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NAME_PATTERN = /^[A-Za-z ]+$/;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    match: [NAME_PATTERN, 'Name can contain only letters and spaces']
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: String,
  address: String,
  createdDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);