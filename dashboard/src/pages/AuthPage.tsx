import React, { useState } from 'react';
import { Scale, Lock, Mail, User, ShieldCheck, KeyRound, Smartphone, Building2 } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (role: 'employee' | 'user' | 'other', organisationName?: string) => void;
  selectedRole: 'employee' | 'user' | 'other';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, selectedRole }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'otp'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Organisation / Entity Selection for 'other' role
  const [selectedOrgPreset, setSelectedOrgPreset] = useState('Hindustan Unilever Ltd');
  const [customOrgName, setCustomOrgName] = useState('');

  const popularOrganisations = [
    'Hindustan Unilever Ltd',
    'Britannia Industries Ltd',
    'Nestlé India Ltd',
    'ITC Limited (FMCG Division)',
    'Tata Consumer Products Ltd',
    'Amul (GCMMF)',
    'Pababl (Custom Organisation...)'
  ];

  const roleTitle = selectedRole === 'employee' 
    ? 'Employee Login' 
    : selectedRole === 'user' 
      ? 'User Login' 
      : 'Organisation / Entity Login';

  const themeColor = selectedRole === 'employee' ? '#1d4ed8' : selectedRole === 'user' ? '#059669' : '#d97706';

  const getFinalOrgName = () => {
    if (selectedOrgPreset === 'Pababl (Custom Organisation...)') {
      return customOrgName.trim() || 'Custom Organisation Entity';
    }
    return selectedOrgPreset;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedRole, selectedRole === 'other' ? getFinalOrgName() : undefined);
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedRole, selectedRole === 'other' ? getFinalOrgName() : undefined);
    }, 500);
  };

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
    }
  };

  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', background: '#ffffff', border: '1px solid #cbd5e1' }}>
        
        {/* Header - Specific ONLY to selectedRole */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: themeColor, margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {selectedRole === 'other' ? <Building2 size={32} /> : <Scale size={32} />}
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
            {roleTitle}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            Legal Metrology Compliance Portal
          </p>
        </div>

        {/* ORGANISATION SELECTION PROMPT FOR 'OTHER' ROLE */}
        {selectedRole === 'other' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} /> Which Organisation do you represent?
            </label>
            
            <select 
              value={selectedOrgPreset}
              onChange={(e) => setSelectedOrgPreset(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', background: '#ffffff', border: '1px solid #d97706', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem', fontWeight: 600, marginBottom: selectedOrgPreset === 'Pababl (Custom Organisation...)' ? '0.75rem' : '0' }}
            >
              {popularOrganisations.map((org, idx) => (
                <option key={idx} value={org}>{org}</option>
              ))}
            </select>

            {selectedOrgPreset === 'Pababl (Custom Organisation...)' && (
              <input 
                type="text"
                value={customOrgName}
                onChange={(e) => setCustomOrgName(e.target.value)}
                placeholder="Type your Organisation / Company Name..."
                required
                style={{ width: '100%', padding: '0.7rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
              />
            )}
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setAuthMode('signin')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', background: 'transparent', color: authMode === 'signin' ? themeColor : '#64748b', fontWeight: 700, borderBottom: authMode === 'signin' ? `2px solid ${themeColor}` : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthMode('signup')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', background: 'transparent', color: authMode === 'signup' ? themeColor : '#64748b', fontWeight: 700, borderBottom: authMode === 'signup' ? `2px solid ${themeColor}` : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Sign Up
          </button>
          <button 
            onClick={() => setAuthMode('otp')}
            style={{ flex: 1, padding: '0.65rem', border: 'none', background: 'transparent', color: authMode === 'otp' ? themeColor : '#64748b', fontWeight: 700, borderBottom: authMode === 'otp' ? `2px solid ${themeColor}` : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            OTP Login
          </button>
        </div>

        {/* Form Body */}
        {authMode !== 'otp' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {selectedRole === 'employee' ? 'Full Name & Designation' : selectedRole === 'user' ? 'Full Name' : 'Authorized Representative Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder={selectedRole === 'employee' ? 'Inspector Rajesh Kumar' : selectedRole === 'user' ? 'Citizen Name' : 'Compliance Manager Name'} 
                    required
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>
                {selectedRole === 'employee' ? 'Officer ID / Email' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'employee' ? 'officer.rajesh@gov.in' : selectedRole === 'other' ? 'compliance@organisation.com' : 'user@example.com'} 
                  required
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isLoading} 
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', background: themeColor }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} />
                  {authMode === 'signin' ? `Sign In & Open Dashboard` : `Create Account & Proceed`}
                </span>
              )}
            </button>
          </form>
        ) : (
          /* OTP Form */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {!otpSent ? (
              <button 
                className="btn-primary" 
                onClick={handleSendOtp} 
                style={{ justifyContent: 'center', background: themeColor }}
              >
                Send OTP
              </button>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '0.35rem' }}>Enter 6-Digit OTP</label>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <KeyRound size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="4 8 2 9 1 0" 
                    maxLength={6}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontSize: '1rem', letterSpacing: '0.2em' }}
                  />
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => onLoginSuccess(selectedRole, selectedRole === 'other' ? getFinalOrgName() : undefined)} 
                  style={{ width: '100%', justifyContent: 'center', background: themeColor }}
                >
                  Verify OTP & Proceed
                </button>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ padding: '0 0.75rem' }}>OR LOGIN WITH GOOGLE</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {/* Login with Google Button */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        </button>

      </div>
    </div>
  );
};
