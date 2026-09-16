import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Utensils,
  User,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';

export const RequestDetailModal = ({
  request,
  isOpen,
  onClose,
  onOpenChat,
  onOpenProof,
  onOpenCancel
}) => {
  const { currentUser, currentPersona } = useAuth();
  if (!isOpen || !request) return null;

  const statusColor =
    request.status === 'PENDING'
      ? 'var(--amber-700)'
      : request.status === 'ACCEPTED'
      ? 'var(--sky-600)'
      : request.status === 'IN_PROGRESS'
      ? 'var(--indigo-600)'
      : request.status === 'DELIVERED'
      ? 'var(--primary-700)'
      : 'var(--slate-600)';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={`badge badge-${request.status.toLowerCase()}`}
              >
                ● {request.status}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                ID: {request.id}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--slate-900)' }}>
              {request.title}
            </h3>
          </div>
          <button className="icon-badge-btn" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--slate-50)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>SERVINGS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                {request.servings} Meals
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>QUANTITY</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                {request.quantityKg} kg
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>GOLDEN HOUR</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--amber-600)' }}>
                {request.goldenHourExpiresInHours ? `${request.goldenHourExpiresInHours}h left` : 'Completed'}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--slate-500)' }}>PICKUP LOCATION</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>{request.pickupAddress}</div>
                {request.instructions && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px', fontStyle: 'italic' }}>
                    Note: "{request.instructions}"
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <User size={18} style={{ color: 'var(--sky-600)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--slate-500)' }}>DONOR &amp; VOLUNTEER ASSIGNMENT</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--slate-800)' }}>
                  <b>Donor:</b> {request.donorName} ({request.donorPhone || 'N/A'})
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--slate-800)' }}>
                  <b>Assigned Volunteer:</b> {request.assignedVolunteerName ? `${request.assignedVolunteerName}` : 'Unassigned (Waiting for nearby volunteer)'}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Proof Inspector (if DELIVERED) */}
          {request.deliveryProof && (
            <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-800)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px' }}>
                <FileCheck size={18} /> Verified Delivery Proof (TRD Section 15)
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: '8px' }}>
                Delivered to: <b>{request.deliveryProof.deliverySpotName}</b> ({request.deliveryProof.beneficiariesFed} people fed)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '3px' }}>Food Inspection Photo:</div>
                  <img src={request.deliveryProof.foodPhotoUrl} alt="Food Proof" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '3px' }}>Beneficiary Handover:</div>
                  <img src={request.deliveryProof.spotPhotoUrl} alt="Spot Proof" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                </div>
              </div>
            </div>
          )}

          {/* Request Status History Audit Trail (TRD Section 5 & 11) */}
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Audit Trail &amp; Status History
            </div>
            <div style={{ borderLeft: '2px solid var(--slate-200)', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {request.statusHistory?.map((h, i) => (
                <div key={i} style={{ fontSize: '0.78rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-19px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-600)' }} />
                  <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                    {h.status} • <span style={{ fontWeight: 500, color: 'var(--slate-500)' }}>{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ color: 'var(--slate-600)' }}>{h.reason} ({h.actor})</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {request.assignedVolunteerId && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onOpenChat(request);
              }}
            >
              <MessageSquare size={16} /> Open Chat
            </button>
          )}

          {currentPersona === 'DONOR' && request.status === 'PENDING' && (
            <button
              className="btn btn-danger"
              onClick={() => {
                onClose();
                onOpenCancel(request);
              }}
            >
              Cancel Request
            </button>
          )}

          {currentPersona === 'VOLUNTEER' && request.status === 'ACCEPTED' && (
            <button
              className="btn btn-danger"
              onClick={() => {
                onClose();
                onOpenCancel(request);
              }}
            >
              Release Mission
            </button>
          )}

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
