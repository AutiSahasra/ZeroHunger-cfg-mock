import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { Header } from './components/Header';
import { DonorPortal } from './views/DonorPortal';
import { VolunteerPortal } from './views/VolunteerPortal';
import { AdminPortal } from './views/AdminPortal';
import { HeartHandshake } from 'lucide-react';

const MainLayout = () => {
  const { currentPersona } = useAuth();

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {currentPersona === 'DONOR' && <DonorPortal />}
        {currentPersona === 'VOLUNTEER' && <VolunteerPortal />}
        {currentPersona === 'ADMIN' && <AdminPortal />}
      </main>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid var(--border-subtle)', padding: '24px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'var(--primary-600)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartHandshake size={14} />
            </div>
            <span><b>No Food Waste</b> — Bridging Food Surplus &amp; Zero Hunger (India)</span>
          </div>

          <div style={{ display: 'flex', gap: '18px' }}>
            <span>Operating in Chennai • Coimbatore • Hyderabad</span>
            <span>Tech Stack: React • MapLibre / Leaflet • Priority Scoring Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <MainLayout />
      </RequestProvider>
    </AuthProvider>
  );
}

export default App;
