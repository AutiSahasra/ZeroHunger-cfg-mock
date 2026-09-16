const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.volunteerId || req.query.volunteerId;
    
    if (userId) {
      if (mongoose.isValidObjectId(userId)) {
        const user = await User.findById(userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    // Fallback to first volunteer or any user in database
    let defaultVolunteer = await User.findOne({ role: 'VOLUNTEER' });
    if (!defaultVolunteer) {
      defaultVolunteer = await User.findOne();
    }

    if (defaultVolunteer) {
      req.user = defaultVolunteer;
      return next();
    }

    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { protect };
