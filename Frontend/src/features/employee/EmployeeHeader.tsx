import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { Employee } from '../../types/user';
import { getUnreadCount } from '../../services/notification.service';

interface EmployeeHeaderProps {
  onHamburgerClick: () => void;
  onSignOutClick: () => void;
}

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconSignOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

/**
 * Friendly display name based on URL path.
 */
const getPageTitle = (pathname: string): string => {
  if (pathname.endsWith('/home') || pathname === '/employee') return 'Dashboard';
  if (pathname.endsWith('/scan')) return 'New Inspection / Scan';
  if (pathname.endsWith('/compliance')) return 'Compliance';
  if (pathname.endsWith('/map')) return 'Inspection Map';
  if (pathname.endsWith('/complaints')) return 'Citizen Complaints';
  if (pathname.endsWith('/inspection')) return 'Inspections';
  if (pathname.endsWith('/products')) return 'Products';
  if (pathname.endsWith('/history')) return 'History';
  if (pathname.endsWith('/reports')) return 'Reports';
  if (pathname.endsWith('/notifications')) return 'Notifications';
  if (pathname.endsWith('/profile')) return 'Profile';
  if (pathname.endsWith('/about')) return 'About';
  if (pathname.endsWith('/settings')) return 'Settings';
  return 'Legal Metrology Compliance System';
};

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  onHamburgerClick,
  onSignOutClick,
}) => {
  const { user } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(getUnreadCount());
  }, [location.pathname]); // re-check when route changes (notifications page may have updated)

  if (!user) return null;

  // Build the role/identity line shown on the right
  const employee = user.role === 'employee' ? (user as Employee) : null;
  const displayRole = employee?.department ?? 'Legal Metrology Officer';
  const displayId = employee?.employeeId ?? '';
  const displayOffice = employee?.office ?? '';

  return (
    <header className="emp-header" role="banner">
      <div className="emp-header__left">
        <button
          className="emp-header__hamburger"
          onClick={onHamburgerClick}
          aria-label="Open navigation menu"
        >
          <IconMenu />
        </button>
        <div className="emp-header__title-block">
          <h1 className="emp-header__title">{pageTitle}</h1>
          <p className="emp-header__subtitle">Legal Metrology Compliance System</p>
        </div>
      </div>

      <div className="emp-header__right">
        <div className="emp-header__user">
          <span className="emp-header__user-name">{user.name}</span>
          <span className="emp-header__user-meta">
            <span className="emp-header__user-role">{displayRole}</span>
            {displayOffice && <span className="emp-header__user-sep"> · </span>}
            {displayOffice && <span className="emp-header__user-office">{displayOffice}</span>}
          </span>
        </div>
        {displayId && (
          <div className="emp-header__id-badge" title="Employee ID">
            {displayId}
          </div>
        )}
        <button
          className="emp-header__bell"
          onClick={() => navigate('/employee/notifications')}
          aria-label="Open notifications"
          title="Notifications"
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="emp-header__bell-badge" aria-label={`${unreadCount} unread notifications`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          className="emp-header__signout"
          onClick={onSignOutClick}
          aria-label="Sign out"
          title="Sign out"
        >
          <IconSignOut />
          <span className="emp-header__signout-text">Sign Out</span>
        </button>
      </div>

      <style>{`
        .emp-header {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--header-height);
          background: linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-navy-800) 100%);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
          z-index: calc(var(--z-sticky) + 1);
          box-shadow: var(--shadow-sm);
          transition: left 0.3s ease;
        }

        .emp-header__left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .emp-header__hamburger {
          display: none;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--color-white);
          padding: var(--space-2);
          border-radius: var(--radius-md);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-fast);
        }

        .emp-header__hamburger:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .emp-header__title-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .emp-header__title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-white);
          margin: 0;
          line-height: 1.2;
        }

        .emp-header__subtitle {
          font-size: var(--font-size-xs);
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .emp-header__right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .emp-header__user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }

        .emp-header__user-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-white);
        }

        .emp-header__user-meta {
          font-size: var(--font-size-xs);
          color: rgba(255, 255, 255, 0.7);
          margin-top: 2px;
        }

        .emp-header__user-sep {
          margin: 0 4px;
        }

        .emp-header__id-badge {
          background: rgba(212, 168, 83, 0.2);
          color: var(--color-gold-400);
          border: 1px solid rgba(212, 168, 83, 0.4);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .emp-header__signout {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--color-white);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: background-color var(--transition-fast);
        }

        .emp-header__signout:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .emp-header__signout-text {
          white-space: nowrap;
        }

        .emp-header__bell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-white);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .emp-header__bell:hover { background: rgba(255, 255, 255, 0.2); }
        .emp-header__bell-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          background: var(--color-error-500);
          color: var(--color-white);
          border-radius: var(--radius-full);
          font-size: 10px;
          font-weight: var(--font-weight-bold);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }

        /* Tablet: collapsed sidebar */
        @media (max-width: 1023px) {
          .emp-header {
            left: var(--sidebar-collapsed-width);
          }
        }

        /* Mobile: full-width header */
        @media (max-width: 768px) {
          .emp-header {
            left: 0;
            height: var(--header-height-mobile);
            padding: 0 var(--space-4);
          }

          .emp-header__hamburger {
            display: flex;
          }

          .emp-header__title {
            font-size: var(--font-size-base);
          }

          .emp-header__subtitle {
            display: none;
          }

          .emp-header__user {
            display: none;
          }

          .emp-header__id-badge {
            display: none;
          }

          .emp-header__signout-text {
            display: none;
          }

          .emp-header__signout {
            padding: var(--space-2);
          }
        }
      `}</style>
    </header>
  );
};

export default EmployeeHeader;
