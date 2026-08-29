import React from 'react';
import { Bell, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>
          Compliance Management System
        </h1>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Shield size={12} />
          PCR 2011 Rules Active
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notification Icon */}
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            position: 'relative',
            padding: '6px',
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            borderLeft: '1px solid #334155',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <UserIcon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
              {user?.fullName || 'Guest User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
              {user?.role || 'Visitor'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <Button variant="ghost" size="sm" onClick={logout} title="Sign Out">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
