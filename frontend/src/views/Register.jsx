import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DONOR',
    phone: '',
  });
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--slate-50)', padding: '40px 20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <HeartHandshake size={48} style={{ color: 'var(--primary-600)', margin: '0 auto' }} />
          <h2 style={{ marginTop: '16px', color: 'var(--slate-800)' }}>Create an Account</h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>Join the No Food Waste mission</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--slate-700)' }}>Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none' }}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--slate-700)' }}>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--slate-700)' }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--slate-700)' }}>Phone (optional)</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none' }}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--slate-700)' }}>Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: '6px', outline: 'none', background: 'white' }}
            >
              <option value="DONOR">Donor</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button 
            type="submit" 
            style={{ background: 'var(--primary-600)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
          >
            Sign Up
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--slate-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};
