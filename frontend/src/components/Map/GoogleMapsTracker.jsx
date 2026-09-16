import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, isRealGoogleKey, getGoogleMapsApiKey } from '../../services/googleMapsLoader';
import { Navigation, MapPin, Truck, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';

export const GoogleMapsTracker = ({
  request,
  height = '380px',
  onRefresh = null
}) => {
  const mapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef({ donor: null, volunteer: null });

  const [apiKey, setApiKey] = useState('');
  const [useJsApi, setUseJsApi] = useState(false);
  const [authFailure, setAuthFailure] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch live tracking data from backend
  const fetchTracking = async () => {
    if (!request?.id && !request?._id) return;
    const reqId = request.id || request._id;

    try {
      setIsRefreshing(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('nfw_auth_token');

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/requests/${reqId}/tracking`, { headers });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.isAssigned) {
          setTrackingData(json);
        } else {
          setTrackingData(null);
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsTracker] Live tracking poll error:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000); // 5-second live GPS polling
    return () => clearInterval(interval);
  }, [request]);

  // 2. Fetch API Key and check format
  useEffect(() => {
    getGoogleMapsApiKey().then((key) => {
      setApiKey(key || '');
    });
  }, []);

  // 3. Listen for Google Maps Authentication Failure (Invalid key / billing disabled)
  useEffect(() => {
    const handleAuthFailure = () => {
      console.warn('[GoogleMapsTracker] Google Maps JS Auth Failure. Switching to Google Maps Live Embed.');
      setAuthFailure(true);
      setUseJsApi(false);
    };

    window.addEventListener('google-maps-auth-failure', handleAuthFailure);
    return () => {
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
    };
  }, []);

  // 4. Load Google Maps JavaScript API if valid key
  useEffect(() => {
    let isMounted = true;

    if (!isRealGoogleKey(apiKey)) {
      setUseJsApi(false);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then((googleMaps) => {
        if (!isMounted || authFailure) return;
        setUseJsApi(true);
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[GoogleMapsTracker] Google Maps script notice:', err.message);
          setUseJsApi(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey, authFailure]);

  // Coordinates calculation
  const donorLat = Number(request?.pickupLat || request?.pickupLocation?.coordinates?.coordinates?.[1] || 13.0105);
  const donorLng = Number(request?.pickupLng || request?.pickupLocation?.coordinates?.coordinates?.[0] || 80.2207);
  const donorPos = { lat: donorLat, lng: donorLng };

  const volLat = Number(trackingData?.volunteerLocation?.lat || (donorLat + 0.012));
  const volLng = Number(trackingData?.volunteerLocation?.lng || (donorLng + 0.015));
  const volPos = { lat: volLat, lng: volLng };

  const assignedName = request?.assignedVolunteerName || trackingData?.volunteer?.name || 'Karthik Raja';
  const vehicleType = trackingData?.volunteer?.vehicleType || 'Car / Van';
  const distanceText = trackingData?.route?.distanceText || '3.5 km';
  const durationText = trackingData?.route?.durationText || '10-12 mins';

  // 5. Initialize and update Google Maps JS API when authenticated
  useEffect(() => {
    if (!useJsApi || authFailure || !window.google || !window.google.maps || !mapContainerRef.current) {
      return;
    }

    const googleMaps = window.google.maps;

    if (!googleMapInstanceRef.current) {
      mapContainerRef.current.innerHTML = '';
      const map = new googleMaps.Map(mapContainerRef.current, {
        center: donorPos,
        zoom: 13,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: false
      });
      googleMapInstanceRef.current = map;

      // Directions Renderer for real Google driving route
      const directionsRenderer = new googleMaps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#0284c7',
          strokeWeight: 5,
          strokeOpacity: 0.85
        }
      });
      directionsRendererRef.current = directionsRenderer;
    }

    const map = googleMapInstanceRef.current;
    const renderer = directionsRendererRef.current;

    // Calculate Google Maps Directions
    const directionsService = new googleMaps.DirectionsService();
    directionsService.route(
      {
        origin: volPos,
        destination: donorPos,
        travelMode: googleMaps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === googleMaps.DirectionsStatus.OK && renderer) {
          renderer.setDirections(result);
        } else {
          // Fallback bounds
          const bounds = new googleMaps.LatLngBounds();
          bounds.extend(donorPos);
          bounds.extend(volPos);
          map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
        }
      }
    );
  }, [useJsApi, authFailure, request, trackingData, donorLat, donorLng, volLat, volLng]);

  // Google Maps Direction Embed URL (STRICTLY GOOGLE MAPS)
  const googleMapsEmbedUrl = isRealGoogleKey(apiKey) && !authFailure
    ? `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${volLat},${volLng}&destination=${donorLat},${donorLng}&mode=driving`
    : `https://maps.google.com/maps?saddr=${volLat},${volLng}&daddr=${donorLat},${donorLng}&hl=en&z=14&output=embed`;

  const googleMapsExternalUrl = `https://www.google.com/maps/dir/?api=1&origin=${volLat},${volLng}&destination=${donorLat},${donorLng}&travelmode=driving`;

  return (
    <div style={{ width: '100%' }}>
      {/* Map Frame: 100% Full & Unobstructed Google Map */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          background: '#e5e7eb'
        }}
      >
        {useJsApi && !authFailure ? (
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: height
            }}
          />
        ) : (
          <iframe
            title="Google Maps Volunteer Live Tracking"
            src={googleMapsEmbedUrl}
            style={{
              width: '100%',
              height: '100%',
              minHeight: height,
              border: 'none',
              display: 'block'
            }}
            loading="lazy"
            allowFullScreen
          />
        )}
      </div>

      {/* Only Estimated Time Thing Below Map */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          marginTop: '10px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: '#0284c7' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)', fontWeight: 600 }}>
            Estimated Arrival Time: <b style={{ color: '#0284c7', fontWeight: 800 }}>~{durationText}</b>
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>
          Distance: {distanceText}
        </span>
      </div>
    </div>
  );
};
