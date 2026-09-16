import React, { useState } from 'react';
import { X, Camera, MapPin, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRequests } from '../../context/RequestContext';

export const DeliveryProofModal = ({ request, isOpen, onClose }) => {
  const { submitDeliveryProof } = useRequests();

  const [deliverySpotName, setDeliverySpotName] = useState(
    'Saidapet Bridge Night Shelter & Relief Center'
  );
  const [beneficiariesFed, setBeneficiariesFed] = useState(request?.servings || 40);
  const [deliveryLat, setDeliveryLat] = useState(13.0210);
  const [deliveryLng, setDeliveryLng] = useState(80.2230);
  const [volunteerNotes, setVolunteerNotes] = useState(
    'Food inspected for temperature and freshness. Handed over to shelter coordinator.'
  );
  const [foodPhotoUrl, setFoodPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60'
  );
  const [spotPhotoUrl, setSpotPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60'
  );

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    submitDeliveryProof(request.id, {
      deliverySpotName,
      beneficiariesFed: Number(beneficiariesFed),
      deliveryLat: Number(deliveryLat),
      deliveryLng: Number(deliveryLng),
      foodPhotoUrl,
      spotPhotoUrl,
      volunteerNotes
    });

    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const presetSpots = [
    { name: 'Koyambedu Labor Migrant Shelter', lat: 13.0694, lng: 80.1948 },
    { name: 'Saidapet Bridge Homeless Shelter', lat: 13.0210, lng: 80.2230 },
    { name: 'Vyasarpadi Community Child Center', lat: 13.1182, lng: 80.2584 }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '6px', borderRadius: '8px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Submit Delivery Proof
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Required photo &amp; GPS verification before marked DELIVERED (TRD Section 15)
              </p>
            </div>
          </div>
          <button className="icon-badge-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Request Summary Card */}
            <div style={{ background: 'var(--slate-50)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                {request.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                From: {request.donorName} • {request.servings} Servings ({request.quantityKg} kg)
              </div>
            </div>

            {/* Destination Selection */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ color: 'var(--primary-600)' }} />
                Delivery Distribution Spot *
              </label>
              <input
                type="text"
                className="form-input"
                value={deliverySpotName}
                onChange={(e) => setDeliverySpotName(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {presetSpots.map((spot, i) => (
                  <button
                    key={i}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    onClick={() => {
                      setDeliverySpotName(spot.name);
                      setDeliveryLat(spot.lat);
                      setDeliveryLng(spot.lng);
                    }}
                  >
                    {spot.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Beneficiaries Fed & GPS */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Beneficiaries Fed *</label>
                <input
                  type="number"
                  className="form-input"
                  value={beneficiariesFed}
                  onChange={(e) => setBeneficiariesFed(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">GPS Coordinate Stamp</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={`${deliveryLat}, ${deliveryLng}`}
                  style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}
                />
              </div>
            </div>

            {/* Photo Previews */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={15} style={{ color: 'var(--primary-600)' }} />
                Photographic Verification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginBottom: '4px', fontWeight: 600 }}>
                    1. Food Freshness Verification
                  </div>
                  <img
                    src={foodPhotoUrl}
                    alt="Food Freshness"
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginBottom: '4px', fontWeight: 600 }}>
                    2. Beneficiary Handover Spot
                  </div>
                  <img
                    src={spotPhotoUrl}
                    alt="Beneficiary Distribution Spot"
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Volunteer Handover Notes</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={volunteerNotes}
                onChange={(e) => setVolunteerNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Complete &amp; Verify Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
