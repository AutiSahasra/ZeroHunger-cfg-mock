const User = require('../models/User');
const FoodRequest = require('../models/FoodRequest');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';
  const token = jwt.sign({ userId, id: userId }, secret, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, region } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Volunteers may need admin approval, so they can start as inactive
    const isActive = role === 'VOLUNTEER' ? false : true;

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      region,
      isActive,
    });

    if (user) {
      // Generate token immediately so the user stays logged in (session persists)
      // They might still have isActive: false which can be checked by the UI or middlewares
      const token = generateToken(res, user._id);
      
      let stats = {};
      if (user.role === 'DONOR') {
        const requests = await FoodRequest.find({ donor: user._id });
        const donationsCount = requests.length;
        const foodDonatedKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { donationsCount, foodDonatedKg };
      } else if (user.role === 'VOLUNTEER') {
        const requests = await FoodRequest.find({ assignedVolunteer: user._id, status: 'DELIVERED' });
        const deliveriesCompleted = requests.length;
        const foodDeliveredKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { deliveriesCompleted, foodDeliveredKg };
      }

      res.status(201).json({
        success: true,
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        ...stats,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          ...stats
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);

      let stats = {};
      if (user.role === 'DONOR') {
        const requests = await FoodRequest.find({ donor: user._id });
        const donationsCount = requests.length;
        const foodDonatedKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { donationsCount, foodDonatedKg };
      } else if (user.role === 'VOLUNTEER') {
        const requests = await FoodRequest.find({ assignedVolunteer: user._id, status: 'DELIVERED' });
        const deliveriesCompleted = requests.length;
        const foodDeliveredKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { deliveriesCompleted, foodDeliveredKg };
      }

      res.status(200).json({
        success: true,
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        ...stats,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          ...stats
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      let stats = {};
      
      if (user.role === 'DONOR') {
        const requests = await FoodRequest.find({ donor: user._id });
        const donationsCount = requests.length;
        const foodDonatedKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { donationsCount, foodDonatedKg };
      } else if (user.role === 'VOLUNTEER') {
        const requests = await FoodRequest.find({ assignedVolunteer: user._id, status: 'DELIVERED' });
        const deliveriesCompleted = requests.length;
        const foodDeliveredKg = requests.reduce((acc, curr) => acc + (curr.quantity ? Math.round(curr.quantity * 0.4) : 0), 0);
        stats = { deliveriesCompleted, foodDeliveredKg };
      }

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        ...stats,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          ...stats
        },
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};
