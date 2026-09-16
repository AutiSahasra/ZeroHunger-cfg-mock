import React, { useState } from 'react';
import { X, Sparkles, MapPin, Clock, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';

export const NewRequestModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { createRequest } = useRequests();

  const [formData, setFormData] = useState({
    title: '',
    foodType: 'Cooked Hot Meals',
    category: 'Cooked Hot Meals',
    dietary: 'Vegetarian',
    servings: 40,
    quantityKg: 18,
    pickupAddress: currentUser?.address || 'Pondy Bazaar, T. Nagar, Chennai',
    pickupLat: currentUser?.lat || 13.0418,
    pickupLng: currentUser?.lng || 80.2341,
    goldenHourExpiresInHours: 3.0,
    instructions: 'Packed hygienically in food-grade thermal containers.',
    photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide a title or description of the surplus food.');
      return;
    }

    createRequest(formData);
    onClose();
  };

  const samplePresets = [
    {
      title: '50 Portions — Veg Pulav & Paneer Butter Masala',
      servings: 50,
      quantityKg: 20,
      photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60'
    },
    {
      title: '70 Meals — Sambar Rice & Curd Rice Boxes',
      servings: 70,
      quantityKg: 28,
      photoUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=60'
    },
    {
      title: '100 Chapatis & Mixed Dal Curry',
      servings: 45,
      quantityKg: 16,
      photoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--amber-100)', color: 'var(--amber-700)', padding: '6px', borderRadius: '8px' }}>
              <Utensils size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Post Surplus Food Donation
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Food rescue alert will notify nearby active volunteers
              </p>
            </div>
          </div>
          <button className="icon-badge-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick autofill sample templates */}
            <div style={{ marginBottom: '16px', background: 'var(--slate-50)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} style={{ color: 'var(--amber-600)' }} /> Quick Fill Templates:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        title: preset.title,
                        servings: preset.servings,
                        quantityKg: preset.quantityKg,
                        photoUrl: preset.photoUrl
                      }))
                    }
                  >
                    {preset.title.split('—')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Title */}
            <div className="form-group">
              <label className="form-label">Food Title / Description *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 50 Meals — Dum Biryani & Raitha"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Category & Dietary */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Cooked Hot Meals">Cooked Hot Meals</option>
                  <option value="Packed Lunch Boxes">Packed Lunch Boxes</option>
                  <option value="Bakery & Bread">Bakery &amp; Bread</option>
                  <option value="Dry Rations & Groceries">Dry Rations</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dietary Preference</label>
                <select
                  className="form-select"
                  value={formData.dietary}
                  onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                >
                  <option value="Vegetarian">Pure Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Jain (No Onion/Garlic)">Jain</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
            </div>

            {/* Servings & Quantity */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estimated Servings (People Fed) *</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  className="form-input"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Approx Weight (Kg)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  className="form-input"
                  value={formData.quantityKg}
                  onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                />
              </div>
            </div>

            {/* Golden Hour Countdown */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} style={{ color: 'var(--amber-600)' }} />
                Golden Hour Window (Distribute within hours)
              </label>
              <select
                className="form-select"
                value={formData.goldenHourExpiresInHours}
                onChange={(e) => setFormData({ ...formData, goldenHourExpiresInHours: e.target.value })}
              >
                <option value="1.5">1.5 Hours (Immediate Urgent Rescue)</option>
                <option value="2.5">2.5 Hours (Standard Cooked Food)</option>
                <option value="4.0">4.0 Hours (Chilled / Dry Packets)</option>
                <option value="6.0">6.0 Hours (Bakery / Produce)</option>
              </select>
            </div>

            {/* Pickup Address */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} style={{ color: 'var(--primary-600)' }} />
                Pickup Location &amp; Instructions *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Pickup address"
                value={formData.pickupAddress}
                onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Additional instructions for volunteer (e.g. Loading bay entrance, ask for Manager Kumar)"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-amber">
              Broadcast Donation Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
