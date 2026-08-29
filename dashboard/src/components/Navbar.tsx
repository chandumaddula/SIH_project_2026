import React from 'react';
import { Scale, UserCheck, Globe, LogOut, Lock, Award, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentRole: 'employee' | 'user' | 'other' | null;
  onSelectRole: (role: 'employee' | 'user' | 'other' | null) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  onShowBootPage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  onLogout,
  isAuthenticated,
  onShowBootPage
}) => {
  return (
    <header className="official-header">
      <div className="tricolor-stripe"></div>
      
      <div className="header-top">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span>🇮🇳 Government of India • Department of Consumer Affairs</span>
          <span style={{ color: '#475569' }}>|</span>
          <span>Legal Metrology (Packaged Commodities) Rules, 2011 Portal</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {onShowBootPage && (
            <button 
              onClick={onShowBootPage}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <RefreshCw size={11} /> View Logo Screen
            </button>
          )}
          <button style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Globe size={13} /> English / हिंदी
          </button>
          <span>A-</span> <span>A</span> <span>A+</span>
          <span className="badge badge-pass" style={{ fontSize: '0.65rem', background: '#16a34a', color: '#fff', border: 'none' }}>SECURE SSL E-GOV</span>
        </div>
      </div>

      <div className="header-main">
        <div className="brand-container" style={{ cursor: 'pointer' }} onClick={() => onSelectRole(null)}>
          <div className="brand-emblem">
            <Scale size={26} color="#ffffff" />
          </div>
          <div className="brand-titles">
            <h1>
              LEGAL METROLOGY COMPLIANCE SYSTEM
              <Award size={18} color="#d97706" />
            </h1>
            <p>AI-Powered Inspection, Verification & Mandatory Declaration Enforcement Platform</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <UserCheck size={16} color="#1d4ed8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
                Mode: {currentRole === 'employee' ? 'Employee' : currentRole === 'user' ? 'User' : 'Other'}
              </span>
              <button 
                onClick={() => onSelectRole(null)}
                style={{ background: 'transparent', border: 'none', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', marginLeft: '0.5rem' }}
              >
                Switch
              </button>
            </div>
          )}

          {isAuthenticated ? (
            <button className="btn-secondary" onClick={onLogout} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <button className="btn-primary" onClick={() => onSelectRole(null)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
              <Lock size={14} /> Portal Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
