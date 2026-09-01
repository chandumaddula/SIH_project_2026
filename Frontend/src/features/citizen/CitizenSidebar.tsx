import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '../../components/Badge';

/* ==========================================================================
   SVG Icons - Consumer-friendly, simple, trustworthy
   ========================================================================== */

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconScan = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconScans = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IconComplaints = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconNotifications = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconLearn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconHelp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconAbout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconSignOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ==========================================================================
   Navigation items
   ========================================================================== */

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const buildNavItems = (onSignOut: () => void): NavItem[] => [
  { path: '/citizen/home', label: 'Home', icon: <IconHome /> },
  { path: '/citizen/scan', label: 'Scan Product', icon: <IconScan /> },
  { path: '/citizen/scans', label: 'My Scans', icon: <IconScans /> },
  { path: '/citizen/complaints', label: 'My Complaints', icon: <IconComplaints /> },
  { path: '/citizen/notifications', label: 'Notifications', icon: <IconNotifications /> },
  { path: '/citizen/learn', label: 'Learn', icon: <IconLearn /> },
  { path: '/citizen/help', label: 'Nearby / Help', icon: <IconHelp /> },
  { path: '/citizen/profile', label: 'Profile', icon: <IconProfile /> },
  { path: '/citizen/about', label: 'About', icon: <IconAbout /> },
  { path: '/citizen/settings', label: 'Settings', icon: <IconSettings /> },
  { path: '/', label: 'Sign Out', icon: <IconSignOut />, onClick: onSignOut },
];

interface CitizenSidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onCollapse?: (collapsed: boolean) => void;
  onSignOutClick: () => void;
}

/* ==========================================================================
   Citizen Sidebar
   ========================================================================== */

export const CitizenSidebar: React.FC<CitizenSidebarProps> = ({
  isOpen,
  isCollapsed = false,
  onClose,
  onCollapse,
  onSignOutClick,
}) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w >= 768) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const navItems = buildNavItems(onSignOutClick);

  const isActive = (path: string) => {
    if (path === '/') return false;
    return location.pathname.startsWith(path);
  };

  const sidebarClass = [
    'cit-sidebar',
    isMobile ? 'cit-sidebar--mobile' : '',
    isMobile && isOpen ? 'cit-sidebar--open' : '',
    isCollapsed ? 'cit-sidebar--collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass} aria-label="Citizen navigation">
        {/* Logo */}
        <div className="cit-sidebar__header">
          <div className="cit-sidebar__logo">
            <div className="cit-sidebar__logo-icon">
              <IconShield />
            </div>
            {!isCollapsed && (
              <div className="cit-sidebar__logo-text">
                <h2 className="cit-sidebar__logo-title">Legal Metrology</h2>
                <p className="cit-sidebar__logo-subtitle">Citizen Portal</p>
              </div>
            )}
          </div>
          {!isMobile && onCollapse && (
            <button
              className="cit-sidebar__collapse-btn"
              onClick={() => onCollapse(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isCollapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Role badge */}
        {!isCollapsed && (
          <div className="cit-sidebar__role">
            <Badge variant="success" size="sm">Verified Consumer</Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="cit-sidebar__nav">
          <ul className="cit-sidebar__menu">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const isSignOut = item.path === '/';

              if (isSignOut) {
                return (
                  <li key={index} className="cit-sidebar__menu-item">
                    <button
                      className="cit-sidebar__nav-link cit-sidebar__nav-link--signout"
                      onClick={() => {
                        onSignOutClick();
                        onClose();
                      }}
                      aria-label="Sign out"
                      title={isCollapsed ? 'Sign Out' : undefined}
                    >
                      <span className="cit-sidebar__nav-icon">{item.icon}</span>
                      {!isCollapsed && (
                        <span className="cit-sidebar__nav-text">{item.label}</span>
                      )}
                    </button>
                  </li>
                );
              }

              return (
                <li key={index} className={`cit-sidebar__menu-item ${active ? 'cit-sidebar__menu-item--active' : ''}`}>
                  <NavLink
                    to={item.path}
                    className="cit-sidebar__nav-link"
                    end={item.path === '/citizen/home'}
                    onClick={() => {
                      if (isMobile) onClose();
                    }}
                    aria-current={active ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="cit-sidebar__nav-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="cit-sidebar__nav-text">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="cit-sidebar__footer">
          {!isCollapsed ? (
            <div className="cit-sidebar__footer-brand">
              <span className="cit-sidebar__footer-version">LMCS v1.0</span>
              <span className="cit-sidebar__footer-sub">Legal Metrology Compliance System</span>
            </div>
          ) : (
            <div className="cit-sidebar__footer-icon" title="LMCS v1.0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .cit-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--citizen-sidebar-width, 256px);
          background-color: var(--color-white);
          border-right: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          z-index: var(--z-sticky);
          transition: width 0.3s ease, transform 0.3s ease;
          overflow: hidden;
        }

        .cit-sidebar--mobile {
          width: var(--citizen-sidebar-width, 256px);
          transform: translateX(-100%);
          box-shadow: var(--shadow-xl);
        }
        .cit-sidebar--mobile.cit-sidebar--open {
          transform: translateX(0);
        }

        .cit-sidebar--collapsed {
          width: var(--sidebar-collapsed-width, 72px);
        }

        .cit-sidebar__header {
          padding: var(--space-5) var(--space-4);
          border-bottom: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--color-navy-700) 0%, var(--color-navy-800) 100%);
        }

        .cit-sidebar__collapse-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          color: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .cit-sidebar__collapse-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .cit-sidebar__logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          overflow: hidden;
          flex: 1;
        }

        .cit-sidebar__logo-icon {
          color: var(--color-white);
          background: rgba(255, 255, 255, 0.15);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cit-sidebar__logo-text {
          overflow: hidden;
          min-width: 0;
        }

        .cit-sidebar__logo-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          color: var(--color-white);
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
        }

        .cit-sidebar__logo-subtitle {
          font-size: var(--font-size-xs);
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          white-space: nowrap;
        }

        .cit-sidebar__role {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-gray-200);
          flex-shrink: 0;
        }

        .cit-sidebar__nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .cit-sidebar__menu {
          list-style: none;
          padding: var(--space-3) 0;
          margin: 0;
        }

        .cit-sidebar__menu-item {
          margin: 0;
        }

        .cit-sidebar__menu-item--active {
          background-color: rgba(34, 197, 94, 0.08);
          border-left: 3px solid var(--color-success-600);
        }

        .cit-sidebar__menu-item--active .cit-sidebar__nav-link {
          color: var(--color-navy-900);
          font-weight: var(--font-weight-semibold);
        }

        .cit-sidebar__nav-link {
          display: flex;
          align-items: center;
          padding: var(--space-3) var(--space-5);
          text-decoration: none;
          color: var(--color-gray-700);
          font-size: var(--font-size-sm);
          gap: var(--space-3);
          transition: background-color var(--transition-fast), color var(--transition-fast);
          width: 100%;
          cursor: pointer;
          background: none;
          border: none;
          border-left: 3px solid transparent;
          font-family: inherit;
        }

        .cit-sidebar__nav-link:hover:not(.cit-sidebar__menu-item--active) {
          background-color: var(--color-gray-100);
          color: var(--color-navy-900);
        }

        .cit-sidebar__nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          color: var(--color-gray-500);
          transition: color var(--transition-fast);
          flex-shrink: 0;
        }

        .cit-sidebar__menu-item--active .cit-sidebar__nav-icon {
          color: var(--color-success-600);
        }

        .cit-sidebar__nav-link:hover .cit-sidebar__nav-icon {
          color: var(--color-navy-700);
        }

        .cit-sidebar__nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .cit-sidebar__nav-link--signout {
          color: var(--color-error-600);
        }

        .cit-sidebar__nav-link--signout:hover {
          background-color: var(--color-error-50);
          color: var(--color-error-700);
        }

        .cit-sidebar__nav-link--signout .cit-sidebar__nav-icon {
          color: var(--color-error-400);
        }

        .cit-sidebar__nav-link--signout:hover .cit-sidebar__nav-icon {
          color: var(--color-error-600);
        }

        /* Collapsed state overrides */
        .cit-sidebar--collapsed .cit-sidebar__logo {
          gap: 0;
        }

        .cit-sidebar--collapsed .cit-sidebar__logo-icon {
          width: 36px;
          height: 36px;
        }

        .cit-sidebar--collapsed .cit-sidebar__nav-link {
          padding: var(--space-3);
          justify-content: center;
        }

        .cit-sidebar__footer {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-gray-200);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cit-sidebar__footer-brand {
          text-align: center;
        }

        .cit-sidebar__footer-version {
          display: block;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-700);
        }

        .cit-sidebar__footer-sub {
          display: block;
          font-size: 10px;
          color: var(--color-gray-500);
          margin-top: 2px;
        }

        .cit-sidebar__footer-icon {
          color: var(--color-gray-400);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .cit-sidebar {
            width: 280px;
          }
        }

        @media (min-width: 768px) {
          .cit-sidebar {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CitizenSidebar;