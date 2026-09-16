import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  MessageSquare,
  Flame,
  Award,
  AlertTriangle,
  ArrowRight,
  PackageCheck,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { MapViewer } from '../components/Map/MapViewer';
import { DeliveryProofModal } from '../components/Modals/DeliveryProofModal';
import { RejectModal } from '../components/Modals/RejectModal';
import { ChatModal } from '../components/Chat/ChatModal';
import { RequestDetailModal } from '../components/Modals/RequestDetailModal';

export const VolunteerPortal = () => {
  const { currentUser } = useAuth();
  const {
    requests,
    getPrioritizedAvailableRequests,
    acceptRequest,
    updateStatus,
    setActiveChatRequestId
  } = useRequests();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Check if volunteer is pending approval (PRD Section 5 & TRD Section 3)
  const isPendingApproval = currentUser?.status === 'PENDING_APPROVAL';

  // Find any active mission assigned to this volunteer
  const activeMission = requests.find(
    (r) =>
      r.assignedVolunteerId === currentUser?.id &&
      ['ACCEPTED', 'IN_PROGRESS'].includes(r.status)
  );

  // Available requests sorted by Distance & Quantity Priority Engine (TRD Section 12)
  const availableRequests = getPrioritizedAvailableRequests(
    currentUser?.currentLat,
    currentUser?.currentLng
  );

  const handleClaim = (req) => {
    if (activeMission) {
      alert(`Single Order Concurrency Rule: You already have an active mission in progress ("${activeMission.title}"). Only one order can be accepted at a time. Once there is no order in progress, then only the next order gets assigned.`);
      return;
    }
    try {
      acceptRequest(req.id);
      setSelectedRequest(req);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdvanceToInProgress = () => {
    if (!activeMission) return;
    updateStatus(activeMission.id, 'IN_PROGRESS', 'Food collected from donor; en route to distribution shelter');
  };

  return (
    <div className="volunteer-portal">
      {/* Pending Approval Notice */}
      {isPendingApproval && (
        <div
          style={{
            background: 'var(--amber-50)',
            border: '1px solid var(--amber-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <AlertTriangle size={24} style={{ color: 'var(--amber-600)', flexShrink: 0 }} />
          <div>
            <h4 style={{ color: 'var(--amber-800)', fontSize: '0.96rem', fontWeight: 700 }}>
              Account Pending Admin Approval
            </h4>
            <p style={{ color: 'var(--amber-700)', fontSize: '0.82rem', marginTop: '2px' }}>
              Your volunteer profile is currently under review by our state NGO operations team. You can preview available food requests on the radar, but claiming missions will be enabled once approved. (You can approve this profile via the <b>Admin</b> tab!).
            </p>
          </div>
        </div>
      )}

      {/* Active Mission Dashboard Banner (If assigned to a mission) */}
      {activeMission && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            padding: '24px',
            marginBottom: '24px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #334155',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <span className="pulse-dot" style={{ background: '#34d399' }} /> Active Live Mission
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginTop: '6px' }}>
                {activeMission.title}
              </h2>
              <div style={{ fontSize: '0.84rem', color: 'var(--slate-300)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <MapPin size={15} style={{ color: 'var(--primary-500)' }} />
                <span>From: {activeMission.donorName} ({activeMission.pickupAddress})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedRequest(activeMission);
                  setActiveChatRequestId(activeMission.id);
                  setIsChatModalOpen(true);
                }}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <MessageSquare size={15} /> Chat with Donor
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setSelectedRequest(activeMission);
                  setIsRejectModalOpen(true);
                }}
              >
                Release Mission
              </button>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="mission-stepper" style={{ margin: '24px 0 20px' }}>
            <div className="stepper-step completed">
              <div className="stepper-circle">✓</div>
              <div className="stepper-label" style={{ color: 'white' }}>Accepted</div>
            </div>
            <div className={`stepper-step ${activeMission.status === 'IN_PROGRESS' ? 'completed' : 'active'}`}>
              <div className="stepper-circle">
                {activeMission.status === 'IN_PROGRESS' ? '✓' : '2'}
              </div>
              <div className="stepper-label" style={{ color: 'white' }}>Food Collection</div>
            </div>
            <div className={`stepper-step ${activeMission.status === 'IN_PROGRESS' ? 'active' : ''}`}>
              <div className="stepper-circle">3</div>
              <div className="stepper-label" style={{ color: 'white' }}>Distribution Transit</div>
            </div>
            <div className="stepper-step">
              <div className="stepper-circle">4</div>
              <div className="stepper-label" style={{ color: 'var(--slate-400)' }}>Proof Verified</div>
            </div>
          </div>

          {/* Action Step Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
            {activeMission.status === 'ACCEPTED' ? (
              <button
                className="btn btn-primary"
                onClick={handleAdvanceToInProgress}
                style={{ fontWeight: 700 }}
              >
                <PackageCheck size={18} /> Confirm Food Picked Up &amp; En Route
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRequest(activeMission);
                  setIsProofModalOpen(true);
                }}
                style={{ fontWeight: 700 }}
              >
                <CheckCircle2 size={18} /> Submit Delivery Proof (Photos + GPS)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Volunteer Profile & KPI Strip */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <Truck size={24} />
          </div>
          <div>
            <div className="stat-value">{currentUser?.deliveriesCompleted || 0}</div>
            <div className="stat-label">Missions Completed</div>
            <div className="stat-subtext">Verified deliveries</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Flame size={24} />
          </div>
          <div>
            <div className="stat-value">{currentUser?.foodDeliveredKg || 0} kg</div>
            <div className="stat-label">Food Transported</div>
            <div className="stat-subtext">Delivered to shelters</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-sky">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{currentUser?.rating || '5.0'} ★</div>
            <div className="stat-label">Volunteer Rating</div>
            <div className="stat-subtext">Punctuality &amp; hygiene score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <Navigation size={24} />
          </div>
          <div>
            <div className="stat-value">{currentUser?.vehicleType?.split(' ')[0] || 'Van'}</div>
            <div className="stat-label">Registered Transport</div>
            <div className="stat-subtext">Cap: {currentUser?.capacityKg || 50} kg</div>
          </div>
        </div>
      </div>

      {/* Main Content: Available Requests Radar (Left) + Interactive Map (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
        {/* Left Column: Prioritized Requests Feed */}
        <div>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Flame size={20} style={{ color: 'var(--rose-500)' }} />
                  <span>Available Food Rescue Feed</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Ranked by <b>Distance &amp; Quantity Priority Engine</b> (TRD Section 12)
                </div>
              </div>
              <span className="badge badge-pending">
                {availableRequests.length} Pending
              </span>
            </div>

            {/* Single Order Concurrency Alert Banner */}
            {activeMission && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <AlertTriangle size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.4 }}>
                  <b>Single Order Concurrency Active:</b> You have an ongoing mission (<b>{activeMission.title}</b>). Per safety guidelines, only one order can be accepted at a time. Once your current delivery is verified &amp; completed, next orders will be unlocked.
                </div>
              </div>
            )}

            {availableRequests.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-400)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 10px', color: 'var(--primary-600)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-800)' }}>
                  All local surplus food rescued!
                </div>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  No pending food rescue calls in this zone right now. Great job!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {availableRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      background: 'white',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {/* Priority Header Strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`priority-chip ${req.urgencyTier.toLowerCase()}`}>
                          ★ Priority Score: {req.priorityScore}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>
                          • {req.calculatedDistanceKm} km away
                        </span>
                      </div>

                      {req.goldenHourExpiresInHours > 0 && (
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--amber-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {req.goldenHourExpiresInHours}h left
                        </span>
                      )}
                    </div>

                    {/* Food Info */}
                    <div>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {req.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                        {req.servings} Servings ({req.quantityKg} kg) • {req.foodType}
                      </div>
                    </div>

                    {/* Pickup Address */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={15} style={{ color: 'var(--primary-600)', marginTop: '2px', flexShrink: 0 }} />
                      <span>{req.pickupAddress}</span>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-100)', paddingTop: '10px', marginTop: '4px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Audit Details
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isPendingApproval || Boolean(activeMission)}
                        onClick={() => handleClaim(req)}
                        title={
                          isPendingApproval
                            ? 'Volunteer profile pending approval'
                            : activeMission
                            ? `Active mission in progress ("${activeMission.title}"). Complete it first to accept next order.`
                            : 'Claim and navigate'
                        }
                      >
                        <Truck size={14} /> {activeMission ? 'Locked (1 Order In Progress)' : 'Claim & Start Rescue'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Map & Food Safety Reminders */}
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className="card-title" style={{ fontSize: '1rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
                <span>Food Rescue Radar</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                Your GPS: {currentUser?.currentLat?.toFixed(2)}, {currentUser?.currentLng?.toFixed(2)}
              </span>
            </div>

            <MapViewer
              requests={requests}
              volunteers={[currentUser]}
              height="340px"
              showHotspots={true}
              onSelectRequest={(r) => {
                setSelectedRequest(r);
                setIsDetailModalOpen(true);
              }}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '8px', textAlign: 'center' }}>
              🍲 Yellow pins = Available pickups • 🚚 Blue pin = Your live position
            </div>
          </div>

          {/* Safety & Protocol Card */}
          <div className="card" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary-700)' }} />
              <h4 style={{ color: 'var(--primary-900)', fontSize: '0.94rem', fontWeight: 700 }}>
                Volunteer Safety &amp; Hygiene Standards
              </h4>
            </div>
            <ul style={{ fontSize: '0.78rem', color: 'var(--slate-700)', paddingLeft: '18px', lineHeight: 1.6 }}>
              <li>Inspect food smell and steam before loading into vehicle containers.</li>
              <li>Keep hot food covered in thermal insulated crates during transit.</li>
              <li>Always capture delivery spot and beneficiary handover photos for proof submission.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeliveryProofModal
        request={selectedRequest || activeMission}
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
      />

      <RejectModal
        request={selectedRequest || activeMission}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        isDonorCancel={false}
      />

      <ChatModal
        request={selectedRequest || activeMission}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <RequestDetailModal
        request={selectedRequest}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenChat={(r) => {
          setActiveChatRequestId(r.id);
          setIsChatModalOpen(true);
        }}
        onOpenCancel={(r) => {
          setIsRejectModalOpen(true);
        }}
      />
    </div>
  );
};
