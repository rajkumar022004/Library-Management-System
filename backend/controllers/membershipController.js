const Membership = require('../models/Membership');
const User = require('../models/User');

exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().populate('user');
    res.json({
      success: true,
      memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id).populate('user');
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    res.json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getMembershipByMembershipId = async (req, res) => {
  try {
    const membership = await Membership.findOne({ 
      membershipId: req.params.membershipId 
    }).populate('user');
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    res.json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.addMembership = async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    
    res.status(201).json({
      success: true,
      message: 'Membership added successfully',
      membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Membership updated successfully',
      membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.extendMembership = async (req, res) => {
  try {
    const { extensionType } = req.body;
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
   
    const durationMap = {
      'SIX_MONTHS': 180,
      'ONE_YEAR': 365,
      'TWO_YEARS': 730
    };
    
    const days = durationMap[extensionType];
    const currentEndDate = new Date(membership.endDate);
    const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    membership.endDate = newEndDate;
    membership.membershipType = extensionType;
    await membership.save();
    
    res.json({
      success: true,
      message: 'Membership extended successfully',
      membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { status: 'CANCELLED' },
      { new: true }
    );
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Membership cancelled successfully',
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.searchMemberships = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    const memberships = await Membership.find({
      $or: [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { membershipId: { $regex: keyword, $options: 'i' } },
        { aadharCardNo: { $regex: keyword, $options: 'i' } }
      ]
    }).populate('user');
    
    res.json({
      success: true,
      memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};