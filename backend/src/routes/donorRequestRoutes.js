const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  getVolunteerTracking,
  getActiveMissionsTracking
} = require('../controllers/donorRequestController');
const { protect, requireDonor } = require('../middlewares/auth');

// All donor request operations require authenticated user with DONOR role
router.use(protect);
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
