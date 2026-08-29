import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, FileCheck, Award, Scale, ArrowRight } from 'lucide-react';

interface BootSplashScreenProps {
  onComplete: () => void;
}

export const BootSplashScreen: React.FC<BootSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress loading animation without technical diagnostic text
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 150); // 3 seconds total smooth boot time (20 ticks x 150ms)

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999, 
        color: '#ffffff', 
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      {/* Indian Flag Tricolor Top Banner */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #128807 100%)' }}></div>

      {/* Main Logo Booting Glass Card */}
      <div 
        style={{ 
          background: 'rgba(255, 255, 255, 0.96)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.3)', 
          borderRadius: '24px', 
          padding: '3.5rem 2.5rem', 
          maxWidth: '580px', 
          width: '100%', 
          textAlign: 'center', 
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(29, 78, 216, 0.25)',
          position: 'relative'
        }}
      >
        {/* Skip Animation Button */}
        <button
          onClick={onComplete}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '9999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#1d4ed8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
        >
          Skip Booting <ArrowRight size={13} />
        </button>

        {/* Animated Official Emblem Logo Container */}
        <div 
          className="boot-logo-container"
          style={{ 
            position: 'relative', 
            width: '140px', 
            height: '140px', 
            margin: '0 auto 1.75rem auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffffff, #eff6ff)',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(29, 78, 216, 0.2)'
          }}
        >
          <img 
            src="/logo/emblem.svg" 
            alt="Legal Metrology Emblem Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              filter: 'drop-shadow(0 4px 12px rgba(29, 78, 216, 0.3))' 
            }} 
          />
        </div>

        {/* Govt Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.9rem', borderRadius: '9999px', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          <Award size={15} color="#d97706" /> Government of India • Department of Consumer Affairs
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          LEGAL METROLOGY COMPLIANCE SYSTEM
        </h1>
        
        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2.25rem' }}>
          Packaged Commodities Rules 2011 Enforcement Platform
        </p>

        {/* Progress Bar Container with Percentage */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8' }}>
              <Cpu size={16} style={{ animation: 'bootRotateRing 2s linear infinite' }} />
              Loading Application...
            </span>
            <span style={{ color: '#1d4ed8', fontFamily: 'monospace', fontSize: '0.95rem' }}>{progress}%</span>
          </div>

          <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', padding: '2px' }}>
            <div 
              className="boot-progress-shimmer"
              style={{ 
                height: '100%', 
                borderRadius: '4px', 
                width: `${progress}%`, 
                transition: 'width 0.15s ease-out' 
              }}
            ></div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.25rem', color: '#64748b', fontSize: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><ShieldCheck size={14} color="#15803d" /> 256-Bit SSL Enclave</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Scale size={14} color="#d97706" /> Metrology Act 2009</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FileCheck size={14} color="#1d4ed8" /> AI OCR Engine</span>
        </div>

      </div>
    </div>
  );
};
