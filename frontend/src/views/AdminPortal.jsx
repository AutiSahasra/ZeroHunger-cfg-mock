import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Map
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminPortal = () => {
  const { currentPersona } = useAuth();
  
  const [activeTab, setActiveTab] = useState('ANALYTICS'); 
  const [volunteers, setVolunteers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState({ totalRequests: 0, statusCounts: {}, totalFoodDelivered: 0 });
  const [hotspots, setHotspots] = useState([]);
  
  const [statusFilter, setStatusFilter] = useState('');
  
  // New Region Form
  const [newRegion, setNewRegion] = useState({ city: '', name: '', longitude: '', latitude: '' });

  // Fetch Data
  const fetchVolunteers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/volunteers', { withCredentials: true });
      setVolunteers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/regions', { withCredentials: true });
      setRegions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/requests?status=${statusFilter}`, { withCredentials: true });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/analytics/overview', { withCredentials: true });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHotspots = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/analytics/hotspots', { withCredentials: true });
      setHotspots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchRegions();
    fetchAnalytics();
    fetchHotspots();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApproveVolunteer = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/volunteers/${id}/approve`, {}, { withCredentials: true });
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivateVolunteer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/volunteers/${id}`, { withCredentials: true });
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/regions', {
        ...newRegion,
        longitude: parseFloat(newRegion.longitude),
        latitude: parseFloat(newRegion.latitude)
      }, { withCredentials: true });
      setNewRegion({ city: '', name: '', longitude: '', latitude: '' });
      fetchRegions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-portal" style={{ padding: '20px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          color: 'white',
          padding: '24px 28px',
          marginBottom: '24px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Command Center</h1>
          <p style={{ opacity: 0.9, marginTop: '4px', fontSize: '0.9rem' }}>Admin Dashboard & Controls</p>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ANALYTICS', label: 'Overview', icon: TrendingUp },
            { id: 'HOTSPOTS', label: 'Hotspots', icon: Flame },
            { id: 'VOLUNTEERS', label: 'Volunteers', icon: Users },
            { id: 'REGIONS', label: 'Regions', icon: Map },
            { id: 'REQUESTS', label: 'History & Proofs', icon: FileCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.1)',
                color: activeTab === tab.id ? '#312e81' : 'white',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'ANALYTICS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.totalRequests}</div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Food Delivered (kg)</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.totalFoodDelivered || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '8px' }}>Pending Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.statusCounts['PENDING'] || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginBottom: '8px' }}>Active Volunteers</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{volunteers.filter(v => v.isActive).length}</div>
          </div>
        </div>
      )}

      {activeTab === 'VOLUNTEERS' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20}/> Manage Volunteers</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(vol => (
                <tr key={vol._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{vol.name}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{vol.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', background: vol.isActive ? '#dcfce7' : '#fef3c7', color: vol.isActive ? '#166534' : '#92400e' }}>
                      {vol.isActive ? 'ACTIVE' : 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {!vol.isActive ? (
                      <button onClick={() => handleApproveVolunteer(vol._id)} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>Approve</button>
                    ) : (
                      <button onClick={() => handleDeactivateVolunteer(vol._id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'REGIONS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Map size={20}/> Add Region</h2>
            <form onSubmit={handleCreateRegion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="City (e.g. Chennai)" value={newRegion.city} onChange={e => setNewRegion({...newRegion, city: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}/>
              <input type="text" placeholder="Region Name (e.g. T.Nagar)" value={newRegion.name} onChange={e => setNewRegion({...newRegion, name: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}/>
              <input type="number" step="any" placeholder="Longitude (e.g. 80.23)" value={newRegion.longitude} onChange={e => setNewRegion({...newRegion, longitude: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}/>
              <input type="number" step="any" placeholder="Latitude (e.g. 13.08)" value={newRegion.latitude} onChange={e => setNewRegion({...newRegion, latitude: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}/>
              <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Create Region</button>
            </form>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '16px' }}>Existing Regions</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {regions.map(r => (
                <li key={r._id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{r.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.city}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {r.center.coordinates[0].toFixed(4)}, {r.center.coordinates[1].toFixed(4)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'HOTSPOTS' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Flame size={20}/> Hunger Hotspots (Delivery Coordinates)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Hotspot ID</th>
                <th style={{ padding: '12px' }}>Longitude</th>
                <th style={{ padding: '12px' }}>Latitude</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((spot, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Proof ID: {spot._id}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{spot.deliveryLocation?.coordinates?.coordinates[0] || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{spot.deliveryLocation?.coordinates?.coordinates[1] || 'N/A'}</td>
                </tr>
              ))}
              {hotspots.length === 0 && <tr><td colSpan="3" style={{ padding: '12px' }}>No deliveries recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'REQUESTS' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FileCheck size={20}/> Request History</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Food Type</th>
                <th style={{ padding: '12px' }}>Quantity</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Region</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{req.foodDetails?.foodType || 'N/A'}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{req.quantity}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', background: '#f1f5f9', color: '#475569' }}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{req.region?.name || 'N/A'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {req.status === 'DELIVERED' && (
                      <button 
                        onClick={async () => {
                          try {
                            const res = await axios.get(`http://localhost:5000/api/admin/requests/${req._id}/proof`, { withCredentials: true });
                            alert(`Proof fetched for ${req._id}. Volunteer: ${res.data.volunteer?.name}. Coords: ${res.data.deliveryLocation?.coordinates?.coordinates.join(', ')}`);
                          } catch (err) {
                            alert('No proof found or error fetching proof.');
                          }
                        }}
                        style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={14} style={{ marginRight: '4px' }}/> View Proof
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
