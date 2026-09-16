const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Support x-user-id header or req.body.volunteerId or default volunteer user for easy testing
    const userId = req.headers['x-user-id'] || req.body.volunteerId || req.query.volunteerId;
    
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Fallback to first volunteer in database if no specific ID passed
    const defaultVolunteer = await User.findOne({ role: 'VOLUNTEER' });
    if (defaultVolunteer) {
      req.user = defaultVolunteer;
      return next();
    }

    return res.status(401).json({ success: false, message: 'Not authorized, volunteer profile not found' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

module.exports = { protect };
