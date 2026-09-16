const express = require('express');
const router = express.Router();
const {
  getMapConfig,
  geocode,
  reverseGeocode,
  placesAutocomplete,
  calculateDistance,
  getStaticMapPreview
} = require('../controllers/mapController');
const { protect } = require('../middlewares/auth');

// Public config and static preview endpoints
router.get('/config', getMapConfig);
router.get('/static-preview', getStaticMapPreview);

// Geocoding, Places search and Distance calculations
router.get('/geocode', protect, geocode);
router.get('/reverse-geocode', protect, reverseGeocode);
router.get('/places/autocomplete', protect, placesAutocomplete);
router.get('/distance', protect, calculateDistance);

module.exports = router;
