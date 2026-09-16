import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useRequests } from '../../context/RequestContext';

export const RejectModal = ({ request, isOpen, onClose, isDonorCancel = false }) => {
  const { rejectRequest, cancelRequest } = useRequests();
  const [reason, setReason] = useState(
    isDonorCancel
      ? 'Surplus food was consumed locally'
      : 'Vehicle mechanical delay; releasing to other volunteers'
  );

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDonorCancel) {
      cancelRequest(request.id, reason);
    } else {
      rejectRequest(request.id, reason);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '6px', borderRadius: '8px' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {isDonorCancel ? 'Cancel Food Request' : 'Release Mission to Queue'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                {isDonorCancel
                  ? 'Permitted only while status is PENDING'
                  : 'Reopens request for nearby active volunteers'}
              </p>
            </div>
          </div>
          <button className="icon-badge-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Reason for {isDonorCancel ? 'cancellation' : 'releasing mission'} *
              </label>
              <textarea
                className="form-textarea"
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Go Back
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm {isDonorCancel ? 'Cancellation' : 'Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
