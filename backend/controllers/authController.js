const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const generateToken = (userId, isAdmin) => {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const normalizeUsername = (value = '') => String(value).trim();
const NAME_PATTERN = /^[A-Za-z ]+$/;


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = normalizeUsername(username);

    
    if (!normalizedUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

   
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

  
    let isMatch = await user.comparePassword(password);

    // Backward compatibility: support old plain-text passwords and migrate to hash.
    if (!isMatch && user.password === password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Self-heal legacy setup where default admin account was created without admin role.
    if (String(user.username).toLowerCase() === 'admin' && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }


    const token = generateToken(user._id, user.isAdmin);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.register = async (req, res) => {
  try {
    const { username, password, name, email, isAdmin } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const normalizedName = String(name || '').trim();
    const normalizedEmail = email ? String(email).trim().toLowerCase() : undefined;

    if (!normalizedUsername || !password || !normalizedName) {
      return res.status(400).json({
        success: false,
        message: 'Username, password and name are required'
      });
    }

    if (!NAME_PATTERN.test(normalizedName)) {
      return res.status(400).json({
        success: false,
        message: 'Name can contain only letters and spaces'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create user
    const user = new User({
      username: normalizedUsername,
      password,
      name: normalizedName,
      email: normalizedEmail,
      isAdmin: String(normalizedUsername).toLowerCase() === 'admin' ? true : (isAdmin || false)
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};