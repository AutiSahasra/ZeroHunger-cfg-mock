const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Check for JWT Cookie or Bearer Token (Auth module)
    let token = req.cookies?.jwt || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zerohunger_jwt_secret_key_2026');
        const user = await User.findById(decoded.userId || decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      } catch (tokenErr) {
        console.warn('JWT verification note:', tokenErr.message);
      }
    }

    // 2. Check for x-user-id header or query param
    const userId = req.headers['x-user-id'] || req.body?.volunteerId || req.query?.volunteerId;
    if (userId && mongoose.isValidObjectId(userId)) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // 3. Fallback to default user in database for demo testing
    let defaultUser = await User.findOne({ role: 'VOLUNTEER' }) || await User.findOne();
    if (defaultUser) {
      req.user = defaultUser;
      return next();
    }

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { protect };
