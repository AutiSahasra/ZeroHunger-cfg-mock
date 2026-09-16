import React, { useState } from 'react';
import {
  HeartHandshake,
  User,
  Truck,
  ShieldCheck,
  Bell,
  MapPin,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRequests } from '../context/RequestContext';
import { resetDemoData } from '../services/storageService';

export const Header = () => {
  const { currentUser, currentPersona, switchPersona, selectedCity, setSelectedCity } = useAuth();
  const { notifications, unreadCount, markNotifRead, refreshData } = useRequests();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default state?')) {
      resetDemoData();
      refreshData();
      window.location.reload();
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand Logo & Mission */}
        <div className="brand-wrapper">
          <div className="brand-icon">
            <HeartHandshake size={24} />
          </div>
          <div>
            <div className="brand-title">
              No Food <span>Waste</span>
            </div>
            <div className="brand-tagline">Food Rescue &amp; Redistribution</div>
          </div>
        </div>

        {/* Center: Interactive Persona Switcher */}
        <div className="persona-switcher" title="Switch between user roles for testing">
          <button
            className={`persona-btn ${currentPersona === 'DONOR' ? 'active donor-mode' : ''}`}
            onClick={() => switchPersona('DONOR')}
          >
            <User size={16} />
            <span>Donor</span>
          </button>
          <button
            className={`persona-btn ${currentPersona === 'VOLUNTEER' ? 'active' : ''}`}
            onClick={() => switchPersona('VOLUNTEER')}
          >
            <Truck size={16} />
            <span>Volunteer</span>
          </button>
          <button
            className={`persona-btn ${currentPersona === 'ADMIN' ? 'active admin-mode' : ''}`}
            onClick={() => switchPersona('ADMIN')}
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </button>
        </div>

        {/* Right Side: City Picker, Notifications, User Meta, Reset Demo */}
        <div className="header-actions">
          {/* City Selector */}
          <div className="city-select-pill">
            <MapPin size={15} style={{ color: 'var(--primary-600)' }} />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Filter city"
            >
              <option value="chennai">Chennai</option>
              <option value="coimbatore">Coimbatore</option>
              <option value="hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Notification Center */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-badge-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </button>

            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '320px',
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px',
                  zIndex: 2500
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '8px'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Notifications</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                    {unreadCount} unread
                  </span>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.82rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotifRead(n.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-md)',
                          background: n.read ? 'transparent' : 'var(--primary-50)',
                          marginBottom: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          borderLeft: n.read ? '2px solid transparent' : '3px solid var(--primary-600)'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{n.title}</div>
                        <div style={{ color: 'var(--slate-600)', fontSize: '0.75rem', marginTop: '2px' }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="user-profile-badge">
            <div className="avatar-initials">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <div className="user-meta-name">{currentUser?.name || 'Guest User'}</div>
              <div className="user-meta-role">{currentPersona}</div>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <button
            className="icon-badge-btn"
            onClick={handleReset}
            title="Reset Mock Database"
            style={{ color: 'var(--slate-400)' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
