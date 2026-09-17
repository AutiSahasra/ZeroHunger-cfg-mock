const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  getVolunteerTracking,
  getActiveMissionsTracking,
  acceptRequest,
  completeDelivery
} = require('../controllers/donorRequestController');
const { protect, requireDonor } = require('../middlewares/auth');

// Protected routes
router.use(protect);

// Acceptance and completion with single order concurrency enforcement
router.post('/:id/accept', acceptRequest);
router.post('/:id/complete', completeDelivery);

router.route('/')
  .post(requireDonor, createRequest);

router.route('/mine')
  .get(requireDonor, getMyRequests);

router.route('/active-tracking')
  .get(requireDonor, getActiveMissionsTracking);

router.route('/:id/tracking')
  .get(requireDonor, getVolunteerTracking);

router.route('/:id')
  .get(requireDonor, getRequestById)
  .patch(requireDonor, updateRequest)
  .delete(requireDonor, cancelRequest);

router.post('/:id/cancel', requireDonor, cancelRequest);

module.exports = router;
