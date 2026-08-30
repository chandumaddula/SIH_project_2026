import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store';

interface AdminHeaderProps {
  onHamburgerClick: () => void;
  onSignOutClick: () => void;
}

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onHamburgerClick, onSignOutClick }) => {
  const { user } = useUserStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="adm-header">
      <div className="adm-header__left">
        <button
          className="adm-header__hamburger"
          onClick={onHamburgerClick}
          aria-label="Open navigation"
        >
          <IconMenu />
        </button>

        <div className="adm-header__brand">
          <div className="adm-header__brand-badge">ADMIN</div>
          <div className="adm-header__brand-text">
            <span className="adm-header__brand-title">Legal Metrology Compliance System</span>
            <span className="adm-header__brand-sub">System Administration</span>
          </div>
        </div>
      </div>

      <div className="adm-header__right">
        <div className="adm-header__datetime" aria-label="Current date and time">
          <span className="adm-header__date">{dateStr}</span>
          <span className="adm-header__time">{timeStr}</span>
        </div>

        <button
          className="adm-header__icon-btn"
          aria-label="Notifications"
          onClick={() => alert('Notification center (placeholder)')}
        >
          <IconBell />
          <span className="adm-header__icon-dot" aria-hidden="true" />
        </button>

        <div className="adm-header__user">
          <div className="adm-header__user-avatar" aria-hidden="true">
            <IconUser />
          </div>
          <div className="adm-header__user-text">
            <span className="adm-header__user-name">{user?.name || 'Administrator'}</span>
            <span className="adm-header__user-role">System Administrator</span>
          </div>
        </div>

        <button className="adm-header__signout" onClick={onSignOutClick}>
          Sign Out
        </button>
      </div>

      <style>{`
        .adm-header {
          position: fixed;
          top: 0;
          left: var(--admin-sidebar-width, 260px);
          right: 0;
          height: var(--admin-header-height, 64px);
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
          z-index: calc(var(--z-sticky) - 1);
          gap: var(--space-4);
        }

        .adm-header__left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .adm-header__hamburger {
          display: none;
          background: none;
          border: none;
          color: #334155;
          padding: var(--space-2);
          cursor: pointer;
          border-radius: var(--radius-md);
        }

        .adm-header__hamburger:hover {
          background: #f1f5f9;
        }

        .adm-header__brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .adm-header__brand-badge {
          font-size: 10px;
          font-weight: var(--font-weight-bold);
          color: white;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          padding: 4px var(--space-2);
          border-radius: var(--radius-sm);
          letter-spacing: 1px;
        }

        .adm-header__brand-text {
          display: flex;
          flex-direction: column;
        }

        .adm-header__brand-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: #0f172a;
          line-height: 1.2;
        }

        .adm-header__brand-sub {
          font-size: 11px;
          color: #64748b;
        }

        .adm-header__right {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .adm-header__datetime {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: var(--font-size-xs);
          color: #475569;
        }

        .adm-header__date {
          font-weight: var(--font-weight-medium);
        }

        .adm-header__time {
          color: #64748b;
        }

        .adm-header__icon-btn {
          position: relative;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .adm-header__icon-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .adm-header__icon-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border: 2px solid #ffffff;
          border-radius: 50%;
        }

        .adm-header__user {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-md);
          cursor: default;
        }

        .adm-header__user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-header__user-text {
          display: flex;
          flex-direction: column;
        }

        .adm-header__user-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: #0f172a;
          line-height: 1.2;
        }

        .adm-header__user-role {
          font-size: 10px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .adm-header__signout {
          font-size: var(--font-size-sm);
          color: #dc2626;
          font-weight: var(--font-weight-medium);
          padding: var(--space-2) var(--space-4);
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .adm-header__signout:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        @media (max-width: 1023px) {
          .adm-header {
            left: var(--admin-sidebar-collapsed, 68px);
          }
          .adm-header__brand-text { display: none; }
        }

        @media (max-width: 768px) {
          .adm-header {
            left: 0;
            height: var(--admin-header-height-mobile, 56px);
            padding: 0 var(--space-3);
          }
          .adm-header__hamburger { display: flex; }
          .adm-header__datetime,
          .adm-header__user-text { display: none; }
          .adm-header__signout {
            padding: var(--space-1) var(--space-3);
            font-size: var(--font-size-xs);
          }
        }
      `}</style>
    </header>
  );
};

export default AdminHeader;
