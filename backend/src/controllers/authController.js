const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token helper
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'zerohunger_donor_jwt_super_secret_key_2026_cfg',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new Food Donor
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      contactPerson,
      email,
      password,
      phone,
      address,
      lat,
      lng,
      cityId,
      regionId
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create donor user
    const user = await User.create({
      name,
      contactPerson: contactPerson || '',
      email: email?.toLowerCase(),
      password,
      phone,
      role: 'DONOR', // Restrict role to DONOR for donor registration
      address,
      lat: lat ? Number(lat) : 13.0418,
      lng: lng ? Number(lng) : 80.2341,
      cityId: cityId || 'chennai',
      regionId: regionId || 'reg-chn-1',
      status: 'ACTIVE'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Food Donor registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        contactPerson: user.contactPerson,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        lat: user.lat,
        lng: user.lng,
        cityId: user.cityId,
        regionId: user.regionId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate Food Donor and return token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        contactPerson: user.contactPerson,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        lat: user.lat,
        lng: user.lng,
        cityId: user.cityId,
        regionId: user.regionId,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout donor / clear session
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};
