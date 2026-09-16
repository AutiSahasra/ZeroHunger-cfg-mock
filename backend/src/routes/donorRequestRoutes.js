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

// All subsequent donor management operations require DONOR role
router.use(requireDonor);

router.route('/')
  .post(createRequest);

router.route('/mine')
  .get(getMyRequests);

router.route('/active-tracking')
  .get(getActiveMissionsTracking);

router.route('/:id/tracking')
  .get(getVolunteerTracking);

router.route('/:id')
  .get(getRequestById)
  .patch(updateRequest)
  .delete(cancelRequest);

router.post('/:id/cancel', cancelRequest);

module.exports = router;
