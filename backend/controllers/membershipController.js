const Membership = require('../models/Membership');
const User = require('../models/User');
const mongoose = require('mongoose');

const resolveUserFromInput = async ({ userId, username }) => {
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return User.findById(userId);
  }

  const normalizedUsername = String(username || '').trim();
  if (normalizedUsername) {
    return User.findOne({ username: normalizedUsername });
  }

  return null;
};

const ensureUserNotLinkedElsewhere = async ({ userId, membershipId }) => {
  if (!userId) {
    return;
  }

  const existingMembership = await Membership.findOne({
    user: userId,
    _id: { $ne: membershipId }
  });

  if (existingMembership) {
    throw new Error(`User is already linked with membership ${existingMembership.membershipId}`);
  }
};

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
    const { id } = req.params;
    const membership = mongoose.Types.ObjectId.isValid(id)
      ? await Membership.findById(id).populate('user')
      : await Membership.findOne({ membershipId: id }).populate('user');

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    if (!req.user.isAdmin) {
      if (!membership.user || String(membership.user._id || membership.user) !== String(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this membership'
        });
      }
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

    if (!req.user.isAdmin) {
      if (!membership.user || String(membership.user._id || membership.user) !== String(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this membership'
        });
      }
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

exports.getMyMembership = async (req, res) => {
  try {
    const membership = await Membership.findOne({ user: req.user.userId }).populate('user');

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No membership linked to this account'
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
    const { linkedUserId, linkedUsername, ...membershipPayload } = req.body;
    const membership = new Membership(membershipPayload);

    if (linkedUserId || linkedUsername) {
      const user = await resolveUserFromInput({ userId: linkedUserId, username: linkedUsername });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Linked user not found'
        });
      }

      await ensureUserNotLinkedElsewhere({ userId: user._id, membershipId: membership._id });
      membership.user = user._id;
    }

    await membership.save();
    await membership.populate('user', 'username name email isAdmin');
    
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
    const { user, linkedUserId, linkedUsername, ...updatePayload } = req.body;

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      updatePayload,
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

    if (!req.user.isAdmin) {
      if (!membership.user || String(membership.user) !== String(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this membership'
        });
      }
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

    if (!req.user.isAdmin) {
      const myMembership = await Membership.findOne({ user: req.user.userId }).populate('user');

      if (!myMembership) {
        return res.json({
          success: true,
          memberships: []
        });
      }

      const normalizedKeyword = String(keyword || '').trim().toLowerCase();
      if (!normalizedKeyword) {
        return res.json({
          success: true,
          memberships: [myMembership]
        });
      }

      const searchable = [
        myMembership.firstName,
        myMembership.lastName,
        myMembership.membershipId,
        myMembership.aadharCardNo
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      const matches = searchable.some((value) => value.includes(normalizedKeyword));
      return res.json({
        success: true,
        memberships: matches ? [myMembership] : []
      });
    }
    
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

exports.linkMembershipToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username } = req.body;

    const membership = mongoose.Types.ObjectId.isValid(id)
      ? await Membership.findById(id)
      : await Membership.findOne({ membershipId: id });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    const user = await resolveUserFromInput({ userId, username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await ensureUserNotLinkedElsewhere({ userId: user._id, membershipId: membership._id });

    membership.user = user._id;
    await membership.save();
    await membership.populate('user', 'username name email isAdmin');

    res.json({
      success: true,
      message: 'Membership linked to user successfully',
      membership
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};