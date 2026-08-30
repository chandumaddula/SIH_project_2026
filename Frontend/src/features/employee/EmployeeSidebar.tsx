import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '../../components/Badge';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode; // SVG element
  badge?: number;
  onClick?: () => void;
}

interface EmployeeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOutClick: () => void;
}

/* ==========================================================================
   SVG Icons (inline, consistent stroke-based)
   ========================================================================== */

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconScan = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconCompliance = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

const IconComplaints = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconInspections = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconProducts = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconHistory = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconReports = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconNotifications = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconProfile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconAbout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IconSignOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ==========================================================================
   Navigation items config
   ========================================================================== */

const buildNavItems = (onSignOut: () => void): NavItem[] => [
  { path: '/employee/home', label: 'Home', icon: <IconHome /> },
  { path: '/employee/scan', label: 'New Inspection / Scan', icon: <IconScan /> },
  { path: '/employee/compliance', label: 'Compliance', icon: <IconCompliance /> },
  { path: '/employee/map', label: 'Inspection Map', icon: <IconMap /> },
  { path: '/employee/complaints', label: 'Complaints', icon: <IconComplaints /> },
  { path: '/employee/inspection', label: 'Inspections', icon: <IconInspections /> },
  { path: '/employee/products', label: 'Products', icon: <IconProducts /> },
  { path: '/employee/history', label: 'History', icon: <IconHistory /> },
  { path: '/employee/reports', label: 'Reports', icon: <IconReports /> },
  { path: '/employee/notifications', label: 'Notifications', icon: <IconNotifications /> },
  { path: '/employee/profile', label: 'Profile', icon: <IconProfile /> },
  { path: '/employee/about', label: 'About', icon: <IconAbout /> },
  { path: '/employee/settings', label: 'Settings', icon: <IconSettings /> },
  { path: '/', label: 'Sign Out', icon: <IconSignOut />, onClick: onSignOut },
];

/* ==========================================================================
   EmployeeSidebar
   ========================================================================== */

export const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({
  isOpen,
  onClose,
  onSignOutClick,
}) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  // Detect responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      if (w >= 1024) {
        // On desktop, close mobile overlay if any
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  // Collapse sidebar on tablet
  useEffect(() => {
    setIsCollapsed(isTablet);
  }, [isTablet]);

  const navItems = buildNavItems(onSignOutClick);

  const isActive = (path: string) => {
    if (path === '/') return false;
    return location.pathname.startsWith(path);
  };

  // Determine sidebar visibility class
  const sidebarClass = [
    'emp-sidebar',
    isMobile ? 'emp-sidebar--mobile' : '',
    isMobile && isOpen ? 'emp-sidebar--open' : '',
    isCollapsed ? 'emp-sidebar--collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass} aria-label="Employee navigation">
        {/* Logo */}
        <div className="emp-sidebar__header">
          <div className="emp-sidebar__logo">
            <div className="emp-sidebar__logo-icon">⚖️</div>
            {!isCollapsed && (
              <div className="emp-sidebar__logo-text">
                <h2 className="emp-sidebar__logo-title">Legal Metrology</h2>
                <p className="emp-sidebar__logo-subtitle">Employee Portal</p>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              className="emp-sidebar__collapse-btn"
              onClick={() => setIsCollapsed(prev => !prev)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand' : 'Collapse'}
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
          <div className="emp-sidebar__role">
            <Badge variant="accent" size="sm">Legal Metrology Officer</Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="emp-sidebar__nav">
          <ul className="emp-sidebar__menu">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const isSignOut = item.path === '/';

              if (isSignOut) {
                return (
                  <li key={index} className="emp-sidebar__menu-item">
                    <button
                      className={`emp-sidebar__nav-link emp-sidebar__nav-link--signout`}
                      onClick={() => {
                        onSignOutClick();
                        onClose();
                      }}
                      aria-label="Sign out"
                      title={isCollapsed ? 'Sign Out' : undefined}
                    >
                      <span className="emp-sidebar__nav-icon">{item.icon}</span>
                      {!isCollapsed && <span className="emp-sidebar__nav-text">{item.label}</span>}
                    </button>
                  </li>
                );
              }

              return (
                <li key={index} className={`emp-sidebar__menu-item ${active ? 'emp-sidebar__menu-item--active' : ''}`}>
                  <NavLink
                    to={item.path}
                    className="emp-sidebar__nav-link"
                    end={item.path === '/employee/home'}
                    onClick={() => {
                      if (isMobile) onClose();
                    }}
                    aria-current={active ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="emp-sidebar__nav-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="emp-sidebar__nav-text">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="emp-sidebar__footer">
          {!isCollapsed && (
            <div className="emp-sidebar__footer-brand">
              <span className="emp-sidebar__footer-version">LMCS v1.0</span>
              <span className="emp-sidebar__footer-sub">Legal Metrology Compliance System</span>
            </div>
          )}
          {isCollapsed && (
            <div className="emp-sidebar__footer-icon" title="LMCS v1.0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .emp-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--sidebar-width);
          background-color: var(--color-white);
          border-right: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          z-index: var(--z-sticky);
          transition: width 0.3s ease, transform 0.3s ease;
          overflow: hidden;
        }

        /* Mobile: hidden off-canvas */
        .emp-sidebar--mobile {
          width: var(--sidebar-width);
          transform: translateX(-100%);
          box-shadow: var(--shadow-xl);
        }
        .emp-sidebar--mobile.emp-sidebar--open {
          transform: translateX(0);
        }

        /* Tablet: collapsed to icon-only */
        .emp-sidebar--collapsed {
          width: var(--sidebar-collapsed-width);
        }

        /* Header */
        .emp-sidebar__header {
          padding: var(--space-5) var(--space-4);
          border-bottom: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          min-height: var(--header-height);
          flex-shrink: 0;
        }

        .emp-sidebar__logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          overflow: hidden;
        }

        .emp-sidebar__logo-icon {
          font-size: 1.5rem;
          background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-700));
          width: 36px;
          height: 36px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emp-sidebar__logo-text {
          overflow: hidden;
          white-space: nowrap;
        }

        .emp-sidebar__logo-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0;
          line-height: 1.2;
        }

        .emp-sidebar__logo-subtitle {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
          margin: 0;
          white-space: nowrap;
        }

        .emp-sidebar__collapse-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          color: var(--color-gray-500);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .emp-sidebar__collapse-btn:hover {
          background-color: var(--color-gray-100);
          color: var(--color-navy-700);
        }

        /* Role badge */
        .emp-sidebar__role {
          padding: var(--space-3) var(--space-5);
          border-bottom: 1px solid var(--color-gray-200);
          flex-shrink: 0;
        }

        /* Navigation */
        .emp-sidebar__nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .emp-sidebar__menu {
          list-style: none;
          padding: var(--space-3) 0;
          margin: 0;
        }

        .emp-sidebar__menu-item {
          margin: 0;
        }

        .emp-sidebar__menu-item--active {
          background-color: var(--color-navy-50);
          border-left: 3px solid var(--color-gold-600);
        }

        .emp-sidebar__menu-item--active .emp-sidebar__nav-link {
          color: var(--color-navy-900);
          font-weight: var(--font-weight-semibold);
        }

        .emp-sidebar__nav-link {
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

        .emp-sidebar--collapsed .emp-sidebar__nav-link {
          padding: var(--space-3);
          justify-content: center;
        }

        .emp-sidebar__nav-link:hover:not(.emp-sidebar__menu-item--active) {
          background-color: var(--color-gray-100);
          color: var(--color-navy-900);
        }

        .emp-sidebar__nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          color: var(--color-gray-500);
          transition: color var(--transition-fast);
          flex-shrink: 0;
        }

        .emp-sidebar__menu-item--active .emp-sidebar__nav-icon {
          color: var(--color-navy-700);
        }

        .emp-sidebar__nav-link:hover .emp-sidebar__nav-icon {
          color: var(--color-navy-700);
        }

        .emp-sidebar__nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .emp-sidebar__nav-link--signout {
          color: var(--color-error-600);
        }

        .emp-sidebar__nav-link--signout:hover {
          background-color: var(--color-error-100);
          color: var(--color-error-600);
        }

        .emp-sidebar__nav-link--signout .emp-sidebar__nav-icon {
          color: var(--color-error-400);
        }

        .emp-sidebar__nav-link--signout:hover .emp-sidebar__nav-icon {
          color: var(--color-error-600);
        }

        /* Footer */
        .emp-sidebar__footer {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-gray-200);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emp-sidebar--collapsed .emp-sidebar__footer {
          padding: var(--space-4) var(--space-3);
        }

        .emp-sidebar__footer-brand {
          text-align: center;
        }

        .emp-sidebar__footer-version {
          display: block;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-700);
        }

        .emp-sidebar__footer-sub {
          display: block;
          font-size: 10px;
          color: var(--color-gray-500);
          margin-top: 2px;
        }

        .emp-sidebar__footer-icon {
          color: var(--color-gray-400);
          display: flex;
          align-items: center;
        }

        /* Tooltips for collapsed state */
        .emp-sidebar--collapsed .emp-sidebar__nav-link[title] {
          position: relative;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .emp-sidebar {
            width: 280px;
          }

          .emp-sidebar__collapse-btn {
            display: none;
          }

          .emp-sidebar__role {
            padding: var(--space-3) var(--space-5);
          }
        }

        @media (max-width: 480px) {
          .emp-sidebar {
            width: 85vw;
          }
        }
      `}</style>
    </>
  );
};

export default EmployeeSidebar;
