const googleMapsService = require('../services/googleMapsService');

// @desc    Get Google Maps JavaScript API Configuration for frontend
// @route   GET /api/maps/config
// @access  Public
exports.getMapConfig = async (req, res, next) => {
  try {
    const apiKey = googleMapsService.getApiKey();
    const isConfigured = googleMapsService.isKeyConfigured();

    res.status(200).json({
      success: true,
      data: {
        provider: 'google-maps',
        apiKey: apiKey,
        scriptUrl: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker`,
        isConfigured,
        defaultCenter: {
          lat: 13.0827,
          lng: 80.2707
        },
        defaultCity: 'Chennai',
        availableFeatures: [
          'Google Maps JS API Rendering',
          'Places Autocomplete for Donor Venues',
          'Geocoding & Reverse Geocoding',
          'Distance Matrix for Transit Duration',
          'Static Map Previews'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Geocode an address into coordinates using Google Maps
// @route   GET /api/maps/geocode
// @access  Private (Donor/Volunteer)
exports.geocode = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "address" is required.'
      });
    }

    const result = await googleMapsService.geocodeAddress(address);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reverse geocode coordinates into address using Google Maps
// @route   GET /api/maps/reverse-geocode
// @access  Private (Donor/Volunteer)
exports.reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Query parameters "lat" and "lng" are required.'
      });
    }

    const result = await googleMapsService.reverseGeocode(Number(lat), Number(lng));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Places Autocomplete for search-as-you-type venue suggestions
// @route   GET /api/maps/places/autocomplete
// @access  Private (Donor/Volunteer)
exports.placesAutocomplete = async (req, res, next) => {
  try {
    const { input } = req.query;

    if (!input || !input.trim()) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const suggestions = await googleMapsService.placesAutocomplete(input.trim());

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate distance and duration using Google Maps Distance Matrix API
// @route   GET /api/maps/distance
// @access  Private (Donor/Volunteer)
exports.calculateDistance = async (req, res, next) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({
        success: false,
        message: 'originLat, originLng, destLat, and destLng are all required.'
      });
    }

    const result = await googleMapsService.calculateDistance(
      Number(originLat),
      Number(originLng),
      Number(destLat),
      Number(destLng)
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Google Static Map preview image URL
// @route   GET /api/maps/static-preview
// @access  Public or Protected
exports.getStaticMapPreview = async (req, res, next) => {
  try {
    const { lat, lng, zoom, width, height } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude are required for static map preview.'
      });
    }

    const staticUrl = googleMapsService.getStaticMapUrl(
      Number(lat),
      Number(lng),
      zoom ? Number(zoom) : 15,
      width ? Number(width) : 600,
      height ? Number(height) : 300
    );

    res.status(200).json({
      success: true,
      data: {
        staticMapUrl: staticUrl,
        lat: Number(lat),
        lng: Number(lng)
      }
    });
  } catch (error) {
    next(error);
  }
};
