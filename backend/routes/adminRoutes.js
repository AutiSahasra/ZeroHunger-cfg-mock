const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const {
  getVolunteers,
  approveVolunteer,
  deactivateVolunteer,
  getRegions,
  createRegion,
  getAnalyticsOverview,
  getHotspots,
  getRequestHistory,
  getDeliveryProof
} = require('../controllers/adminController');

// All routes are protected and require admin
router.use(protect, admin);

router.route('/volunteers')
  .get(getVolunteers);

router.route('/volunteers/:id/approve')
  .post(approveVolunteer);

router.route('/volunteers/:id')
  .delete(deactivateVolunteer);

router.route('/regions')
  .get(getRegions)
  .post(createRegion);

router.route('/analytics/overview')
  .get(getAnalyticsOverview);

router.route('/analytics/hotspots')
  .get(getHotspots);

router.route('/requests')
  .get(getRequestHistory);

router.route('/requests/:id/proof')
  .get(getDeliveryProof);

module.exports = router;
