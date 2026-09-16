const express = require('express');
const router = express.Router();
const { getDonorStats } = require('../controllers/donorStatsController');
const { protect, requireDonor } = require('../middlewares/auth');

router.use(protect);
router.use(requireDonor);

router.get('/stats', getDonorStats);

module.exports = router;
