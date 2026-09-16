import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';

export const MapViewer = ({
  requests = [],
  hotspots = [],
  volunteers = [],
  highlightRequestId = null,
  onSelectRequest = null,
  height = '380px',
  showHotspots = true
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const { selectedCity } = useAuth();

  // City center coordinates
  const cityCoordinates = {
    chennai: [13.0450, 80.2400],
    coimbatore: [11.0168, 76.9558],
    hyderabad: [17.3850, 78.4867]
  };

  const center = cityCoordinates[selectedCity] || [13.0450, 80.2400];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: 12,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, 12);
    }
  }, [selectedCity]);

  // Update markers when requests, hotspots, or volunteers change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const group = markersGroupRef.current;
    group.clearLayers();

    // 1. Plot Food Requests
    requests.forEach((req) => {
      if (!req.pickupLat || !req.pickupLng) return;

      const isHighlighted = req.id === highlightRequestId;
      const statusColor =
        req.status === 'PENDING'
          ? '#f59e0b'
          : req.status === 'ACCEPTED'
          ? '#0ea5e9'
          : req.status === 'IN_PROGRESS'
          ? '#6366f1'
          : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: ${statusColor};
            width: ${isHighlighted ? '38px' : '30px'};
            height: ${isHighlighted ? '38px' : '30px'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 2.5px solid white;
            transform: translate(-50%, -50%);
          ">
            🍲
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([req.pickupLat, req.pickupLng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
            ${req.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            ${req.pickupAddress}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 6px;">
            <span style="color: #059669;">👥 ${req.servings} Servings</span>
            <span style="color: ${statusColor}; text-transform: uppercase;">● ${req.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onSelectRequest) {
        marker.on('click', () => onSelectRequest(req));
      }

      group.addLayer(marker);
    });

    // 2. Plot Hunger / Need Hotspots (TRD Section 17)
    if (showHotspots && hotspots && hotspots.length > 0) {
      hotspots.forEach((spot) => {
        if (!spot.lat || !spot.lng) return;

        // Radius proportional to deliveries count
        const radius = Math.min(1400, Math.max(500, (spot.deliveriesCount || 10) * 25));

        const circle = L.circle([spot.lat, spot.lng], {
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.22,
          radius: radius,
          weight: 2
        });

        circle.bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="background: #ffe4e6; color: #e11d48; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;">HUNGER HOTSPOT</span>
            </div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${spot.name}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              ${spot.description || 'Community shelter / high-density relief zone'}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #e11d48;">
              🍛 ${spot.totalMealsReceived || 0} Total Meals Received
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
              Deliveries Logged: ${spot.deliveriesCount}
            </div>
          </div>
        `);

        group.addLayer(circle);
      });
    }

    // 3. Plot Active Volunteer Positions (TRD Section 14)
    volunteers.forEach((vol) => {
      if (!vol.currentLat || !vol.currentLng) return;

      const volIcon = L.divIcon({
        className: 'volunteer-marker',
        html: `
          <div style="
            background: #0284c7;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.35);
            border: 2px solid white;
            transform: translate(-50%, -50%);
          ">
            🚚
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([vol.currentLat, vol.currentLng], { icon: volIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 12px; color: #0284c7;">Active Volunteer</div>
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${vol.name}</div>
          <div style="font-size: 11px; color: #64748b;">${vol.vehicleType || 'Motorbike / Van'}</div>
          <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 4px;">★ ${vol.rating || 5.0} • ${vol.deliveriesCompleted || 0} Deliveries</div>
        </div>
      `);

      group.addLayer(marker);
    });
  }, [requests, hotspots, volunteers, highlightRequestId, showHotspots]);

  return (
    <div
      ref={mapContainerRef}
      className="map-frame"
      style={{ height: height }}
    />
  );
};
