const axios = require('axios');

/**
 * Service for Google Maps API operations
 * Implements Geocoding, Reverse Geocoding, Places Autocomplete,
 * Place Details, Distance Matrix, and Static Map generation.
 */
class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  getApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY || '';
  }

  isKeyConfigured() {
    const key = this.getApiKey();
    return Boolean(key && !key.startsWith('YOUR_') && !key.includes('DemoKey'));
  }

  /**
   * Geocode a human-readable address into { lat, lng, formattedAddress, placeId, city, state, postalCode }
   * @param {string} address
   */
  async geocodeAddress(address) {
    if (!address) {
      throw new Error('Address is required for geocoding.');
    }

    const apiKey = this.getApiKey();

    if (!this.isKeyConfigured()) {
      return {
        lat: 13.0418,
        lng: 80.2341,
        formattedAddress: address,
        placeId: 'mock-place-id',
        isMock: true,
        notice: 'Using fallback coordinates because valid GOOGLE_MAPS_API_KEY is not configured in .env'
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address, key: apiKey }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        let city = '';
        let state = '';
        let postalCode = '';

        result.address_components.forEach((comp) => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('postal_code')) postalCode = comp.long_name;
        });

        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          city,
          state,
          postalCode,
          isMock: false
        };
      } else {
        throw new Error(response.data.error_message || `Geocoding status: ${response.data.status}`);
      }
    } catch (err) {
      console.warn(`[GoogleMaps] Geocode error: ${err.message}. Using fallback coordinates.`);
      return {
        lat: 13.0418,
        lng: 80.2341,
        formattedAddress: address,
        isMock: true,
        error: err.message
      };
    }
  }

  /**
   * Reverse geocode { lat, lng } into a formatted street address
   * @param {number} lat
   * @param {number} lng
   */
  async reverseGeocode(lat, lng) {
    if (lat === undefined || lng === undefined) {
      throw new Error('Both lat and lng are required for reverse geocoding.');
    }

    const apiKey = this.getApiKey();

    if (!this.isKeyConfigured()) {
      return {
        formattedAddress: `T. Nagar, Chennai, Tamil Nadu 600017 (Location: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat: Number(lat),
        lng: Number(lng),
        isMock: true,
        notice: 'Using fallback address because valid GOOGLE_MAPS_API_KEY is not configured in .env'
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { latlng: `${lat},${lng}`, key: apiKey }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return {
          formattedAddress: response.data.results[0].formatted_address,
          lat: Number(lat),
          lng: Number(lng),
          placeId: response.data.results[0].place_id,
          isMock: false
        };
      } else {
        throw new Error(response.data.error_message || `Reverse geocoding status: ${response.data.status}`);
      }
    } catch (err) {
      console.warn(`[GoogleMaps] Reverse geocode error: ${err.message}.`);
      return {
        formattedAddress: `Coordinates: ${lat}, ${lng}`,
        lat: Number(lat),
        lng: Number(lng),
        isMock: true,
        error: err.message
      };
    }
  }

  /**
   * Places Autocomplete for donor venue/address typing
   * @param {string} input - user search input
   */
  async placesAutocomplete(input) {
    if (!input) return [];
    const apiKey = this.getApiKey();

    if (!this.isKeyConfigured()) {
      return [
        {
          description: `${input} - Chennai, Tamil Nadu, India`,
          placeId: 'mock-place-1',
          mainText: input,
          secondaryText: 'Chennai, Tamil Nadu, India'
        },
        {
          description: `${input} Banquet Hall, Guindy, Chennai`,
          placeId: 'mock-place-2',
          mainText: `${input} Banquet Hall`,
          secondaryText: 'Guindy, Chennai'
        }
      ];
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
        params: {
          input,
          key: apiKey,
          components: 'country:in'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.predictions.map((p) => ({
          description: p.description,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || ''
        }));
      }
      return [];
    } catch (err) {
      console.warn(`[GoogleMaps] Places Autocomplete error: ${err.message}`);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates using Google Distance Matrix API
   */
  async calculateDistance(originLat, originLng, destLat, destLng) {
    const apiKey = this.getApiKey();

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Number((R * c).toFixed(2));
    };

    if (!this.isKeyConfigured()) {
      const dist = haversineDistance(originLat, originLng, destLat, destLng);
      return {
        distanceKm: dist,
        durationMinutes: Math.round(dist * 3),
        distanceText: `${dist} km`,
        durationText: `${Math.round(dist * 3)} mins`,
        isMock: true
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: `${originLat},${originLng}`,
          destinations: `${destLat},${destLng}`,
          key: apiKey
        }
      });

      const element = response.data?.rows?.[0]?.elements?.[0];
      if (element && element.status === 'OK') {
        return {
          distanceKm: Number((element.distance.value / 1000).toFixed(2)),
          durationMinutes: Math.round(element.duration.value / 60),
          distanceText: element.distance.text,
          durationText: element.duration.text,
          isMock: false
        };
      }
      throw new Error(element?.status || 'Distance calculation error');
    } catch (err) {
      const dist = haversineDistance(originLat, originLng, destLat, destLng);
      return {
        distanceKm: dist,
        durationMinutes: Math.round(dist * 3),
        distanceText: `${dist} km`,
        durationText: `${Math.round(dist * 3)} mins`,
        isMock: true,
        error: err.message
      };
    }
  }

  /**
   * Get driving directions and route coordinates between volunteer and donor pickup
   */
  async getDirections(originLat, originLng, destLat, destLng) {
    const apiKey = this.getApiKey();

    if (!this.isKeyConfigured()) {
      return {
        routePoints: [
          { lat: Number(originLat), lng: Number(originLng) },
          { lat: (Number(originLat) + Number(destLat)) / 2 + 0.002, lng: (Number(originLng) + Number(destLng)) / 2 - 0.001 },
          { lat: Number(destLat), lng: Number(destLng) }
        ],
        overviewPolyline: '',
        distanceKm: Number(Math.abs(originLat - destLat) * 111).toFixed(1),
        durationText: '10-15 mins',
        isMock: true
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destLat},${destLng}`,
          mode: 'driving',
          key: apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];

        return {
          overviewPolyline: route.overview_polyline?.points || '',
          distanceKm: Number((leg.distance.value / 1000).toFixed(2)),
          distanceText: leg.distance.text,
          durationMinutes: Math.round(leg.duration.value / 60),
          durationText: leg.duration.text,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps.map((s) => ({
            instructions: s.html_instructions?.replace(/<[^>]*>?/gm, ''),
            distance: s.distance.text,
            duration: s.duration.text
          })),
          isMock: false
        };
      }
      throw new Error(response.data.error_message || 'Directions not found');
    } catch (err) {
      console.warn(`[GoogleMaps] Directions error: ${err.message}`);
      return {
        overviewPolyline: '',
        distanceKm: 3.5,
        durationText: '12 mins',
        isMock: true,
        error: err.message
      };
    }
  }

  /**
   * Generate a Google Static Maps image URL for a food request pickup location
   */
  getStaticMapUrl(lat, lng, zoom = 15, width = 600, height = 300) {
    const apiKey = this.getApiKey();
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=roadmap&markers=color:red%7Clabel:D%7C${lat},${lng}&key=${apiKey}`;
  }
}

module.exports = new GoogleMapsService();
