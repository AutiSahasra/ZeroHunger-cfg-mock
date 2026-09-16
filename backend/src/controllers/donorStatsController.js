const FoodRequest = require('../models/FoodRequest');
const mongoose = require('mongoose');

// @desc    Get donor impact statistics & dashboard KPI metrics
// @route   GET /api/donors/me/stats
// @access  Private (Donor only)
exports.getDonorStats = async (req, res, next) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user._id);

    // Run aggregation pipeline for current donor matching 'donor' field
    const stats = await FoodRequest.aggregate([
      { $match: { donor: donorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalServings: { $sum: '$quantity' },
          totalQuantityKg: { $sum: '$quantityKg' }
        }
      }
    ]);

    let totalRequests = 0;
    let totalServings = 0;
    let totalQuantityKg = 0;
    let successfulDeliveries = 0;
    let pendingRequests = 0;
    let inTransitRequests = 0;
    let cancelledRequests = 0;

    stats.forEach((item) => {
      totalRequests += item.count;
      totalServings += item.totalServings || 0;
      totalQuantityKg += item.totalQuantityKg || Math.round((item.totalServings || 0) * 0.4);

      if (item._id === 'DELIVERED') {
        successfulDeliveries = item.count;
      } else if (item._id === 'PENDING') {
        pendingRequests = item.count;
      } else if (item._id === 'ACCEPTED' || item._id === 'IN_PROGRESS') {
        inTransitRequests += item.count;
      } else if (item._id === 'CANCELLED') {
        cancelledRequests = item.count;
      }
    });

    const deliverySuccessRate = totalRequests > 0
      ? Number(((successfulDeliveries / totalRequests) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        donor: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone
        },
        kpis: {
          totalRequests,
          totalServings,
          totalQuantityKg,
          successfulDeliveries,
          pendingRequests,
          inTransitRequests,
          cancelledRequests,
          deliverySuccessRate: `${deliverySuccessRate}%`,
          estimatedPeopleFed: totalServings,
          co2DivertedKg: Number((totalQuantityKg * 2.5).toFixed(1))
        },
        breakdownByStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = {
            count: curr.count,
            servings: curr.totalServings,
            quantityKg: curr.totalQuantityKg
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};
