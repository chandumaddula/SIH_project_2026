import React from 'react';
import { Shield, Users, Building2, ChevronRight, Award } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'employee' | 'user' | 'other') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div style={{ maxWidth: '640px', width: '100%', margin: '2rem auto', padding: '0 1.25rem' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.35rem 0.9rem', borderRadius: '9999px', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Award size={15} color="#d97706" /> Government of India • Legal Metrology Portal
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
          Select Portal Access Mode
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Choose your account category to proceed to authentication
        </p>
      </div>

      <div className="vertical-stack" style={{ gap: '1.25rem' }}>
        
        {/* 1. Employee */}
        <div 
          className="glass-card" 
          onClick={() => onSelectRole('employee')}
          style={{ 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            border: '2px solid #1d4ed8',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.4rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(29, 78, 216, 0.18)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(29, 78, 216, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)' }}>
              <Shield size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Employee
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Enforcement Officer & Legal Metrology Inspector Portal
              </p>
            </div>
          </div>
          <ChevronRight size={24} color="#1d4ed8" />
        </div>

        {/* 2. User */}
        <div 
          className="glass-card" 
          onClick={() => onSelectRole('user')}
          style={{ 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            border: '2px solid #059669',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.4rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(5, 150, 105, 0.18)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(5, 150, 105, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)' }}>
              <Users size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                User
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Citizen & Consumer Grievance Protection Portal
              </p>
            </div>
          </div>
          <ChevronRight size={24} color="#059669" />
        </div>

        {/* 3. Other */}
        <div 
          className="glass-card" 
          onClick={() => onSelectRole('other')}
          style={{ 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            border: '2px solid #d97706',
            background: '#ffffff',
            borderRadius: '14px',
            padding: '1.4rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(217, 119, 6, 0.18)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(217, 119, 6, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)' }}>
              <Building2 size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Other
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Manufacturer, Packer & Importer Rule 27 Entity Vault
              </p>
            </div>
          </div>
          <ChevronRight size={24} color="#d97706" />
        </div>

      </div>
    </div>
  );
};
