const User = require('../models/User');
const Region = require('../models/Region');
const FoodRequest = require('../models/FoodRequest');
const DeliveryProof = require('../models/DeliveryProof');

// @desc    Get all volunteers
// @route   GET /api/admin/volunteers
// @access  Private/Admin
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'VOLUNTEER' }).select('-password');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or approve volunteer
// @route   POST /api/admin/volunteers/:id/approve
// @access  Private/Admin
const approveVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'VOLUNTEER') {
      user.isActive = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Volunteer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove/deactivate volunteer
// @route   DELETE /api/admin/volunteers/:id
// @access  Private/Admin
const deactivateVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'VOLUNTEER') {
      user.isActive = false; // Soft delete
      await user.save();
      res.json({ message: 'Volunteer deactivated' });
    } else {
      res.status(404).json({ message: 'Volunteer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get regions
// @route   GET /api/admin/regions
// @access  Private/Admin
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find({});
    res.json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create region
// @route   POST /api/admin/regions
// @access  Private/Admin
const createRegion = async (req, res) => {
  try {
    const { city, name, longitude, latitude } = req.body;
    
    // Create point using provided long/lat, defaults to 0,0 if not provided for now
    const center = {
      type: 'Point',
      coordinates: [longitude || 0, latitude || 0]
    };

    const region = new Region({
      city,
      name,
      center,
    });

    const createdRegion = await region.save();
    res.status(201).json(createdRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analytics Overview
// @route   GET /api/admin/analytics/overview
// @access  Private/Admin
const getAnalyticsOverview = async (req, res) => {
  try {
    const totalRequests = await FoodRequest.countDocuments();
    
    const statusCounts = await FoodRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const foodCollected = await FoodRequest.aggregate([
      { $match: { status: 'DELIVERED' } },
      { $group: { _id: null, totalFood: { $sum: '$quantity' } } }
    ]);

    res.json({
      totalRequests,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalFoodDelivered: foodCollected[0]?.totalFood || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hotspots
// @route   GET /api/admin/analytics/hotspots
// @access  Private/Admin
const getHotspots = async (req, res) => {
  try {
    // Return delivery proofs with coordinates for hotspot mapping
    const deliveries = await DeliveryProof.find({}).select('deliveryLocation.coordinates');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get request history
// @route   GET /api/admin/requests
// @access  Private/Admin
const getRequestHistory = async (req, res) => {
  try {
    // Optional filtering query params
    const { city, status } = req.query;
    let query = {};
    
    if (status) query.status = status;
    
    const requests = await FoodRequest.find(query)
      .populate('donor', 'name email')
      .populate('assignedVolunteer', 'name email')
      .populate('region', 'city name')
      .sort({ createdAt: -1 });
      
    // City filtering could be done by looking up the region's city if needed.
    // For simplicity, we return the populated requests.
    let filteredRequests = requests;
    if (city) {
      filteredRequests = requests.filter(r => r.region && r.region.city.toLowerCase() === city.toLowerCase());
    }

    res.json(filteredRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery proof
// @route   GET /api/admin/requests/:id/proof
// @access  Private/Admin
const getDeliveryProof = async (req, res) => {
  try {
    const proof = await DeliveryProof.findOne({ request: req.params.id })
      .populate('volunteer', 'name');
    
    if (proof) {
      res.json(proof);
    } else {
      res.status(404).json({ message: 'Proof not found for this request' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVolunteers,
  approveVolunteer,
  deactivateVolunteer,
  getRegions,
  createRegion,
  getAnalyticsOverview,
  getHotspots,
  getRequestHistory,
  getDeliveryProof
};
