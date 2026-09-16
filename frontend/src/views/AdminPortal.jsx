import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Flame,
  Users,
  CheckCircle2,
  Sliders,
  FileCheck,
  Eye,
  Filter,
  UserCheck,
  UserX,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { MapViewer } from '../components/Map/MapViewer';
import { RequestDetailModal } from '../components/Modals/RequestDetailModal';
import { setVolunteerApproval } from '../services/storageService';

export const AdminPortal = () => {
  const { users } = useAuth();
  const { requests, hotspots, priorityWeights, updateWeights, refreshData } = useRequests();

  const [activeTab, setActiveTab] = useState('ANALYTICS'); // 'ANALYTICS', 'HOTSPOTS', 'VOLUNTEERS', 'REQUESTS', 'PRIORITY'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Stats calculation
  const totalFoodDeliveredKg = requests
    .filter((r) => r.status === 'DELIVERED')
    .reduce((acc, r) => acc + (r.quantityKg || 0), 0);
  const totalMealsDelivered = requests
    .filter((r) => r.status === 'DELIVERED')
    .reduce((acc, r) => acc + (r.servings || 0), 0);
  const totalPendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const activeVolunteersList = users.filter((u) => u.role === 'VOLUNTEER');

  // Filtered requests
  const filteredRequests =
    statusFilter === 'ALL'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const handleApproval = (volId, approve) => {
    setVolunteerApproval(volId, approve);
    refreshData();
  };

  return (
    <div className="admin-portal">
      {/* Admin Top Header Bar */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: 'white',
          padding: '24px 28px',
          marginBottom: '24px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '8px' }}>
            <ShieldCheck size={14} /> State NGO Control &amp; Analytics Console
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Command Center &amp; Food Rescue Operations
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '0.88rem', marginTop: '2px' }}>
            Live geospatial coordination, volunteer dispatch verification, and hunger density mapping for Tamil Nadu &amp; Telangana.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: 'var(--radius-lg)', flexWrap: 'wrap' }}>
          {[
            { id: 'ANALYTICS', label: 'Overview', icon: TrendingUp },
            { id: 'HOTSPOTS', label: 'Hunger Hotspots', icon: Flame },
            { id: 'VOLUNTEERS', label: 'Volunteers', icon: Users },
            { id: 'REQUESTS', label: 'Request History', icon: FileCheck },
            { id: 'PRIORITY', label: 'Priority Tuner', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? '#312e81' : 'white',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS OVERVIEW */}
      {activeTab === 'ANALYTICS' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-emerald">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">{totalMealsDelivered}</div>
                <div className="stat-label">Total Meals Delivered</div>
                <div className="stat-subtext">{totalFoodDeliveredKg} kg rescued food</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-amber">
                <Flame size={24} />
              </div>
              <div>
                <div className="stat-value">{totalPendingRequests}</div>
                <div className="stat-label">Pending Golden-Hour Rescues</div>
                <div className="stat-subtext">Awaiting nearby volunteer pickup</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-sky">
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">
                  {activeVolunteersList.filter((v) => v.status === 'ACTIVE').length}
                </div>
                <div className="stat-label">Active Field Volunteers</div>
                <div className="stat-subtext">
                  {activeVolunteersList.filter((v) => v.status === 'PENDING_APPROVAL').length} awaiting approval
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-indigo">
                <MapPin size={24} />
              </div>
              <div>
                <div className="stat-value">{hotspots.length}</div>
                <div className="stat-label">Identified Need Hotspots</div>
                <div className="stat-subtext">Geospatial delivery clusters</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>Statewide Live Logistics &amp; Hunger Clusters</span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                  MapLibre / Leaflet Engine
                </span>
              </div>
              <MapViewer
                requests={requests}
                hotspots={hotspots}
                volunteers={activeVolunteersList}
                height="380px"
                showHotspots={true}
                onSelectRequest={(r) => {
                  setSelectedRequest(r);
                  setIsDetailModalOpen(true);
                }}
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <FileCheck size={18} style={{ color: 'var(--primary-600)' }} />
                  <span>Recent Status Transitions</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      background: 'var(--slate-50)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className={`badge badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        {req.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--slate-800)' }}>
                      {req.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                      Donor: {req.donorName} • Assigned: {req.assignedVolunteerName || 'None'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: HUNGER & NEED HOTSPOT ANALYZER (TRD Section 17 & PRD Section 10.5) */}
      {activeTab === 'HOTSPOTS' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">
                  <Flame size={20} style={{ color: 'var(--rose-500)' }} />
                  <span>Hunger / Need Region Identification</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Aggregating recurring delivery coordinates to detect high-density community demand zones (TRD Section 17).
                </p>
              </div>
            </div>

            <MapViewer
              requests={requests.filter((r) => r.status === 'DELIVERED')}
              hotspots={hotspots}
              height="380px"
              showHotspots={true}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building size={18} style={{ color: 'var(--primary-600)' }} />
                <span>Aggregated Delivery Hotspot Clusters</span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-600)' }}>
                  <th style={{ padding: '10px 12px' }}>Hotspot Name &amp; Description</th>
                  <th style={{ padding: '10px 12px' }}>GPS Coordinates</th>
                  <th style={{ padding: '10px 12px' }}>Total Meals Received</th>
                  <th style={{ padding: '10px 12px' }}>Deliveries Logged</th>
                  <th style={{ padding: '10px 12px' }}>Urgency Level</th>
                  <th style={{ padding: '10px 12px' }}>Last Delivery</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((spot) => (
                  <tr key={spot.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{spot.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>{spot.description}</div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--slate-600)' }}>
                      {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-700)' }}>
                      🍛 {spot.totalMealsReceived} Meals
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      {spot.deliveriesCount} drops
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`priority-chip ${spot.urgencyLevel.toLowerCase()}`}>
                        {spot.urgencyLevel} NEED
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      {spot.lastDelivery}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTEER MANAGEMENT (PRD Section 10.1 & TRD Section 8) */}
      {activeTab === 'VOLUNTEERS' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Users size={20} style={{ color: 'var(--primary-600)' }} />
                <span>Volunteer Onboarding &amp; Fleet Roster</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Manage volunteer verification, vehicle capacity, and administrative activation.
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-600)' }}>
                <th style={{ padding: '10px 12px' }}>Volunteer</th>
                <th style={{ padding: '10px 12px' }}>Phone / Region</th>
                <th style={{ padding: '10px 12px' }}>Vehicle &amp; Capacity</th>
                <th style={{ padding: '10px 12px' }}>Completed Missions</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeVolunteersList.map((vol) => (
                <tr key={vol.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{vol.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>{vol.email}</div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--slate-700)' }}>
                    <div>{vol.phone}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>{vol.regionId}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div>{vol.vehicleType || 'Two Wheeler'}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                      Max {vol.capacityKg || 30} kg
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <b>{vol.deliveriesCompleted || 0}</b> deliveries ({vol.foodDeliveredKg || 0} kg)
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background:
                          vol.status === 'ACTIVE'
                            ? 'var(--primary-100)'
                            : vol.status === 'PENDING_APPROVAL'
                            ? 'var(--amber-100)'
                            : 'var(--slate-200)',
                        color:
                          vol.status === 'ACTIVE'
                            ? 'var(--primary-800)'
                            : vol.status === 'PENDING_APPROVAL'
                            ? 'var(--amber-800)'
                            : 'var(--slate-600)'
                      }}
                    >
                      {vol.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {vol.status === 'PENDING_APPROVAL' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApproval(vol.id, true)}
                      >
                        <UserCheck size={14} /> Approve
                      </button>
                    ) : vol.status === 'ACTIVE' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleApproval(vol.id, false)}
                      >
                        <UserX size={14} /> Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleApproval(vol.id, true)}
                      >
                        Re-activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: FILTERABLE REQUEST HISTORY & DELIVERY PROOF AUDIT */}
      {activeTab === 'REQUESTS' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileCheck size={20} style={{ color: 'var(--primary-600)' }} />
                <span>Complete Request Lifecycle Audit</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Filter across cities, status transitions, and inspect photo evidence.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={15} style={{ color: 'var(--slate-500)' }} />
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-600)' }}>
                <th style={{ padding: '10px 12px' }}>Request Title &amp; Details</th>
                <th style={{ padding: '10px 12px' }}>Donor</th>
                <th style={{ padding: '10px 12px' }}>Servings / Qty</th>
                <th style={{ padding: '10px 12px' }}>Assigned Volunteer</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{req.title}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>{req.pickupAddress}</div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--slate-800)' }}>
                    {req.donorName}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {req.servings} meals ({req.quantityKg} kg)
                  </td>
                  <td style={{ padding: '12px', color: 'var(--slate-700)' }}>
                    {req.assignedVolunteerName || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye size={14} /> View Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: PRIORITY SCORING WEIGHTS TUNER (TRD Section 12) */}
      {activeTab === 'PRIORITY' && (
        <div className="card" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Sliders size={20} style={{ color: 'var(--primary-600)' }} />
                <span>Distance &amp; Quantity Priority Engine Configuration</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                TRD Section 12: Priority Score = (Distance Weight × Distance Score) + (Quantity Weight × Quantity Score).
              </p>
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--slate-800)', textAlign: 'center', marginBottom: '16px', background: 'white', padding: '10px', borderRadius: '8px', border: '1px dashed var(--slate-300)' }}>
              Priority Score = ({priorityWeights.distanceWeight.toFixed(2)} × DistanceScore) + ({priorityWeights.quantityWeight.toFixed(2)} × QuantityScore)
            </div>

            {/* Slider 1: Distance Weight */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Distance Proximity Weight:</span>
                <span style={{ color: 'var(--primary-700)' }}>
                  {(priorityWeights.distanceWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={priorityWeights.distanceWeight}
                onChange={(e) => {
                  const distW = parseFloat(e.target.value);
                  const qtyW = parseFloat((1.0 - distW).toFixed(2));
                  updateWeights({ distanceWeight: distW, quantityWeight: qtyW });
                }}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                <span>Prioritizes hyper-local quick response</span>
                <span>Balances with bulk batch rescue</span>
              </div>
            </div>

            {/* Slider 2: Quantity Weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>
                <span>Food Quantity / Volume Weight:</span>
                <span style={{ color: 'var(--amber-700)' }}>
                  {(priorityWeights.quantityWeight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={priorityWeights.quantityWeight}
                onChange={(e) => {
                  const qtyW = parseFloat(e.target.value);
                  const distW = parseFloat((1.0 - qtyW).toFixed(2));
                  updateWeights({ distanceWeight: distW, quantityWeight: qtyW });
                }}
                style={{ width: '100%', accentColor: 'var(--amber-600)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                <span>Prioritizes large institutional banquets</span>
                <span>Prevents rejection of small-scale meals</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                alert('Priority scoring weights updated successfully across all volunteer feeds!');
              }}
            >
              Save Configuration to Engine
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenChat={() => {}}
        onOpenCancel={() => {}}
      />
    </div>
  );
};
