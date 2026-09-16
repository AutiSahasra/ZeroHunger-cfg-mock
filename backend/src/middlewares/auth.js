const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes via JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'zerohunger_donor_jwt_super_secret_key_2026_cfg'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
      error: error.message
    });
  }
};

// Authorize Donor role specifically
const requireDonor = (req, res, next) => {
  if (!req.user || req.user.role !== 'DONOR') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. This action is restricted to verified Food Donors.'
    });
  }
  next();
};

module.exports = {
  protect,
  requireDonor
};
