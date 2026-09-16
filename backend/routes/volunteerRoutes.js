const express = require('express');
const router = express.Router();
const {
  getAvailableRequests,
  createFoodRequest,
  acceptRequest,
  rejectRequest,
  submitDeliveryProof,
  updateRequestStatus,
  getVolunteerStats,
  updateVolunteerLocation
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

// Food requests endpoints
router.post('/requests', protect, createFoodRequest);
router.get('/requests/available', protect, getAvailableRequests);

// Volunteer action endpoints on specific requests
router.post('/requests/:id/accept', protect, acceptRequest);
router.post('/requests/:id/reject', protect, rejectRequest);
router.post('/requests/:id/delivery-proof', protect, submitDeliveryProof);
router.patch('/requests/:id/status', protect, updateRequestStatus);

// Volunteer profile stats & live GPS location update
router.get('/volunteers/me/stats', protect, getVolunteerStats);
router.patch('/volunteers/me/location', protect, updateVolunteerLocation);

module.exports = router;
