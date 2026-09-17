import React, { useState } from 'react';
import {
  PlusCircle,
  Utensils,
  Clock,
  MapPin,
  MessageSquare,
  Eye,
  CheckCircle2,
  HeartHandshake,
  TrendingUp,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { GoogleMapsTracker } from '../components/Map/GoogleMapsTracker';
import { NewRequestModal } from '../components/Modals/NewRequestModal';
import { RequestDetailModal } from '../components/Modals/RequestDetailModal';
import { ChatModal } from '../components/Chat/ChatModal';
import { RejectModal } from '../components/Modals/RejectModal';

export const DonorPortal = () => {
  const { currentUser } = useAuth();
  const { requests, setActiveChatRequestId, getRequestDetails } = useRequests();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'ACTIVE', 'COMPLETED'
  const [activeTrackedRequest, setActiveTrackedRequest] = useState(null);
  const [mapMode, setMapMode] = useState('GOOGLE_MAPS_TRACKER'); // 'GOOGLE_MAPS_TRACKER', 'OVERVIEW'

  // Filter requests for current donor
  const myRequests = requests.filter(
    (r) => r.donorId === (currentUser?.id || currentUser?._id) || r.donorName === currentUser?.name
  );

  const assignedRequest = myRequests.find((r) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(r.status) || r.assignedVolunteerName || r.assignedVolunteer
  );
  const currentTracked = activeTrackedRequest || assignedRequest || myRequests[0];

  const activeRequests = myRequests.filter((r) =>
    ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status)
  );
  const completedRequests = myRequests.filter((r) => r.status === 'DELIVERED');

  const displayedRequests =
    filterTab === 'ACTIVE'
      ? activeRequests
      : filterTab === 'COMPLETED'
      ? completedRequests
      : myRequests;

  // Stats calculation
  const totalMeals = myRequests.reduce((acc, r) => acc + (r.servings || 0), 0);
  const totalKg = myRequests.reduce((acc, r) => acc + (r.quantityKg || 0), 0);
  const successfulDeliveries = completedRequests.length;

  return (
    <div className="donor-portal">
      {/* Top Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          color: 'white',
          padding: '30px',
          marginBottom: '24px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.4)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>
            <HeartHandshake size={15} /> Verified Food Donor Portal
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Welcome, {currentUser?.name}
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '580px', fontSize: '0.92rem', marginTop: '4px' }}>
            Every meal rescued feeds a vulnerable child, senior citizen, or daily laborer in the golden hour before spoilage.
          </p>
        </div>

        <button
          className="btn btn-amber btn-lg"
          onClick={() => setIsNewModalOpen(true)}
          style={{ boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)', fontWeight: 800 }}
        >
          <PlusCircle size={20} />
          <span>Post Surplus Food Request</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Utensils size={24} />
          </div>
          <div>
            <div className="stat-value">{totalMeals}</div>
            <div className="stat-label">Total Servings Rescued</div>
            <div className="stat-subtext">~ {Math.round(totalMeals * 0.4)} kg food diverted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{successfulDeliveries}</div>
            <div className="stat-label">Successful Deliveries</div>
            <div className="stat-subtext">100% verified with GPS &amp; photos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-sky">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{activeRequests.length}</div>
            <div className="stat-label">Active Missions</div>
            <div className="stat-subtext">Coordinating with volunteers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{(totalKg * 1.9).toFixed(0)} kg</div>
            <div className="stat-label">CO2 Emission Offset</div>
            <div className="stat-subtext">Environmental impact score</div>
          </div>
        </div>
      </div>

      {/* 🗺️ LARGE GOOGLE MAPS LIVE TRACKING HERO SECTION (Full Width, Prominent) */}
      <div
        id="donor-live-tracking-map"
        className="card"
        style={{
          padding: '24px',
          marginBottom: '28px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-subtle)',
          background: 'white'
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                background: '#e0f2fe',
                color: '#0284c7',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Navigation size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--slate-900)'
                }}
              >
                <span>Live Volunteer GPS Tracking</span>
                {currentTracked && (
                  <span
                    className={`badge badge-${(currentTracked.status || 'PENDING').toLowerCase()}`}
                    style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                  >
                    {currentTracked.status === 'ACCEPTED' ? 'Volunteer En Route' : currentTracked.status}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                {currentTracked ? (
                  <span>
                    Tracking Mission: <b>{currentTracked.title}</b>
                    {currentTracked.assignedVolunteerName && (
                      <> • Assigned Volunteer: <b style={{ color: '#0284c7' }}>{currentTracked.assignedVolunteerName}</b></>
                    )}
                  </span>
                ) : (
                  <span>Real-time dispatch route connecting assigned volunteer to your food pickup location</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeRequests.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Switch Mission:</span>
                <select
                  value={currentTracked?.id || currentTracked?._id || ''}
                  onChange={(e) => {
                    const found = myRequests.find((r) => (r.id || r._id) === e.target.value);
                    if (found) setActiveTrackedRequest(found);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'white',
                    color: 'var(--slate-800)'
                  }}
                >
                  {activeRequests.map((r) => (
                    <option key={r.id || r._id} value={r.id || r._id}>
                      {r.title} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span className="pulse-dot" style={{ background: '#0284c7' }} /> Google Maps Engine
            </span>
          </div>
        </div>

        {/* Large Map Canvas */}
        <GoogleMapsTracker
          request={currentTracked}
          height="520px"
        />
      </div>

      {/* 📋 ALL INFORMATION SECTION BELOW THE LARGE MAP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '24px' }}>
        {/* Left Column: Requests Management */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <div className="card-header">
              <div className="card-title">
                <Utensils size={20} style={{ color: 'var(--primary-600)' }} />
                <span>My Surplus Food Requests</span>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--slate-100)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
                {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      background: filterTab === tab ? 'white' : 'transparent',
                      color: filterTab === tab ? 'var(--slate-900)' : 'var(--slate-500)',
                      boxShadow: filterTab === tab ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            {displayedRequests.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-400)' }}>
                <Utensils size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No requests in this view</div>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  Click "Post Surplus Food Request" to notify nearby volunteers.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayedRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      transition: 'all 0.15s ease',
                      background: req.status === 'PENDING' ? '#fffdf7' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`badge badge-${req.status.toLowerCase()}`}>
                            {req.status === 'PENDING' && <span className="pulse-dot" style={{ background: '#d97706' }} />}
                            {req.status}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                            {req.dietary} • {req.servings} Servings
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                          {req.title}
                        </h4>
                      </div>

                      {req.goldenHourExpiresInHours > 0 && req.status !== 'DELIVERED' && (
                        <div style={{ background: 'var(--amber-50)', color: 'var(--amber-700)', border: '1px solid var(--amber-200)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Clock size={13} /> {req.goldenHourExpiresInHours}h left
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <MapPin size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {req.pickupAddress}
                      </span>
                    </div>

                    {/* Volunteer Info Bar */}
                    {req.assignedVolunteerName && (
                      <div style={{ background: 'var(--sky-50)', border: '1px solid #bae6fd', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.78rem', color: 'var(--sky-800)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span>Assigned Volunteer: <b>{req.assignedVolunteerName}</b></span>
                        <span style={{ fontWeight: 600 }}>Status: {req.status}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-100)', paddingTop: '10px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          try {
                            const fullDetails = await getRequestDetails(req.id || req._id);
                            setSelectedRequest(fullDetails || req);
                          } catch (err) {
                            setSelectedRequest(req);
                          }
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye size={14} /> Details &amp; Audit
                      </button>

                      {(req.assignedVolunteerId || req.assignedVolunteerName || req.assignedVolunteer) && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: currentTracked?.id === req.id || currentTracked?._id === req._id ? '#0284c7' : 'var(--slate-100)',
                              color: currentTracked?.id === req.id || currentTracked?._id === req._id ? 'white' : 'var(--slate-700)',
                              fontWeight: 700
                            }}
                            onClick={() => {
                              setActiveTrackedRequest(req);
                              setMapMode('GOOGLE_MAPS_TRACKER');
                              const mapEl = document.getElementById('donor-live-tracking-map');
                              if (mapEl) {
                                mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }}
                          >
                            <Navigation size={14} /> Track on Map
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedRequest(req);
                              setActiveChatRequestId(req.id || req._id);
                              setIsChatOpen(true);
                            }}
                          >
                            <MessageSquare size={14} /> Chat
                          </button>
                        </>
                      )}

                      {req.status === 'PENDING' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsCancelOpen(true);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Mission Details & Golden Hour Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Mission Card */}
          {currentTracked ? (
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0284c7' }}>
                  Mission Underway
                </span>
                <span className={`badge badge-${(currentTracked.status || 'pending').toLowerCase()}`}>
                  {currentTracked.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '8px' }}>
                {currentTracked.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: 'var(--slate-600)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Utensils size={15} style={{ color: 'var(--primary-600)' }} />
                  <span>{currentTracked.servings} Servings ({currentTracked.quantityKg || Math.round(currentTracked.servings * 0.4)} kg) • {currentTracked.dietary || 'Standard Meals'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={15} style={{ color: 'var(--primary-600)', marginTop: '2px', flexShrink: 0 }} />
                  <span>{currentTracked.pickupAddress}</span>
                </div>

                {currentTracked.assignedVolunteerName && (
                  <div style={{ background: '#f0f9ff', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', marginTop: '4px' }}>
                    <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '2px' }}>
                      Volunteer: {currentTracked.assignedVolunteerName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                      {currentTracked.assignedVolunteerPhone ? `Phone: ${currentTracked.assignedVolunteerPhone}` : 'Connected via GPS live dispatch'}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setSelectedRequest(currentTracked);
                    setActiveChatRequestId(currentTracked.id || currentTracked._id);
                    setIsChatOpen(true);
                  }}
                >
                  <MessageSquare size={14} /> Open Volunteer Chat
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    try {
                      const fullDetails = await getRequestDetails(currentTracked.id || currentTracked._id);
                      setSelectedRequest(fullDetails || currentTracked);
                    } catch (err) {
                      setSelectedRequest(currentTracked);
                    }
                    setIsDetailOpen(true);
                  }}
                >
                  <Eye size={14} /> Audit Trail
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-500)' }}>
              <Navigation size={32} style={{ margin: '0 auto 10px', color: '#0284c7', opacity: 0.7 }} />
              <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>No Active Mission Selected</div>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                When a volunteer claims your surplus food request, live GPS tracking and route information will update automatically above.
              </p>
            </div>
          )}

          {/* Golden Hour Guidelines Card */}
          <div className="card" style={{ background: 'var(--slate-900)', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Clock size={18} style={{ color: 'var(--amber-400)' }} />
              <h4 style={{ color: 'white', fontSize: '0.96rem', fontWeight: 700 }}>
                The Golden Hour Protocol
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-300)', lineHeight: 1.5 }}>
              Cooked surplus food retains optimal nutrition and hygiene if redistributed within <b>3 hours</b> of completion. Our priority dispatch engine routes the nearest available volunteer to your pickup point.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <RequestDetailModal
        request={selectedRequest}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenChat={(r) => {
          setActiveChatRequestId(r.id);
          setIsChatOpen(true);
        }}
        onOpenCancel={(r) => {
          setIsCancelOpen(true);
        }}
      />

      <ChatModal
        request={selectedRequest}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <RejectModal
        request={selectedRequest}
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        isDonorCancel={true}
      />
    </div>
  );
};
