import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose: () => void;
  onCollapse?: (collapsed: boolean) => void;
  onSignOutClick: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ==========================================================================
   SVG Icons — Admin distinctive set
   ========================================================================== */

const IconOverview = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconAnalytics = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IconEmployees = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCitizens = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconInspections = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconComplaints = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconProducts = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconRules = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const IconGeography = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconReports = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconAnnouncements = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconRoles = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const IconAudit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const IconNotifications = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconSignOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ==========================================================================
   Navigation groups
   ========================================================================== */

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { path: '/admin/overview', label: 'Overview', icon: <IconOverview /> },
      { path: '/admin/analytics', label: 'Analytics', icon: <IconAnalytics /> },
    ],
  },
  {
    label: 'Entity Management',
    items: [
      { path: '/admin/employees', label: 'Employees', icon: <IconEmployees /> },
      { path: '/admin/citizens', label: 'Citizens', icon: <IconCitizens /> },
      { path: '/admin/products', label: 'Products', icon: <IconProducts /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/admin/inspections', label: 'Inspections', icon: <IconInspections /> },
      { path: '/admin/complaints', label: 'Complaints', icon: <IconComplaints /> },
      { path: '/admin/geography', label: 'Geographic Monitoring', icon: <IconGeography /> },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { path: '/admin/rules', label: 'Rule Management', icon: <IconRules /> },
      { path: '/admin/roles', label: 'Roles & Permissions', icon: <IconRoles /> },
    ],
  },
  {
    label: 'Communication',
    items: [
      { path: '/admin/announcements', label: 'Announcements', icon: <IconAnnouncements /> },
      { path: '/admin/notifications', label: 'Notifications', icon: <IconNotifications /> },
    ],
  },
  {
    label: 'Oversight',
    items: [
      { path: '/admin/reports', label: 'Reports', icon: <IconReports /> },
      { path: '/admin/audit', label: 'Audit Logs', icon: <IconAudit /> },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings', label: 'System Settings', icon: <IconSettings /> },
    ],
  },
];

/* ==========================================================================
   Admin Sidebar
   Distinctive dark government/enterprise design
   ========================================================================== */

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
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
      if (w >= 768) onClose();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const sidebarClass = [
    'adm-sidebar',
    isMobile ? 'adm-sidebar--mobile' : '',
    isMobile && isOpen ? 'adm-sidebar--open' : '',
    isCollapsed ? 'adm-sidebar--collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass} aria-label="Admin navigation">
        {/* Logo */}
        <div className="adm-sidebar__header">
          <div className="adm-sidebar__logo">
            <div className="adm-sidebar__logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="adm-sidebar__logo-text">
                <span className="adm-sidebar__logo-title">LMCS Admin</span>
                <span className="adm-sidebar__logo-sub">Control Center</span>
              </div>
            )}
          </div>
          {!isMobile && onCollapse && (
            <button
              className="adm-sidebar__collapse-btn"
              onClick={() => onCollapse(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isCollapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="adm-sidebar__nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="adm-sidebar__group">
              {!isCollapsed && (
                <span className="adm-sidebar__group-label">{group.label}</span>
              )}
              <ul className="adm-sidebar__group-items">
                {group.items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path} className={`adm-sidebar__item ${active ? 'adm-sidebar__item--active' : ''}`}>
                      <NavLink
                        to={item.path}
                        className="adm-sidebar__link"
                        end={item.path === '/admin/overview'}
                        onClick={() => { if (isMobile) onClose(); }}
                        aria-current={active ? 'page' : undefined}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className="adm-sidebar__link-icon">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="adm-sidebar__link-label">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Sign out */}
          <div className="adm-sidebar__group">
            <ul className="adm-sidebar__group-items">
              <li className="adm-sidebar__item">
                <button
                  className="adm-sidebar__link adm-sidebar__link--signout"
                  onClick={() => { onSignOutClick(); onClose(); }}
                  aria-label="Sign out"
                  title={isCollapsed ? 'Sign Out' : undefined}
                >
                  <span className="adm-sidebar__link-icon"><IconSignOut /></span>
                  {!isCollapsed && (
                    <span className="adm-sidebar__link-label">Sign Out</span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="adm-sidebar__footer">
          {!isCollapsed ? (
            <div className="adm-sidebar__footer-brand">
              <span className="adm-sidebar__footer-version">v1.0.0</span>
              <span className="adm-sidebar__footer-env">Frontend Demo</span>
            </div>
          ) : (
            <div className="adm-sidebar__footer-icon" title="LMCS Admin v1.0.0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .adm-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--admin-sidebar-width, 260px);
          background: #0f172a;
          display: flex;
          flex-direction: column;
          z-index: var(--z-sticky);
          transition: width 0.3s ease, transform 0.3s ease;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .adm-sidebar--mobile {
          transform: translateX(-100%);
          box-shadow: 4px 0 20px rgba(0,0,0,0.4);
        }

        .adm-sidebar--mobile.adm-sidebar--open {
          transform: translateX(0);
        }

        .adm-sidebar--collapsed {
          width: var(--sidebar-collapsed-width, 72px);
        }

        /* Header */
        .adm-sidebar__header {
          padding: var(--space-4) var(--space-4);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }

        .adm-sidebar__collapse-btn {
          background: rgba(255,255,255,0.06);
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          color: rgba(148,163,184,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .adm-sidebar__collapse-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #f1f5f9;
        }

        .adm-sidebar__logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .adm-sidebar__logo-icon {
          width: 36px;
          height: 36px;
          background: rgba(59,130,246,0.2);
          border: 1px solid rgba(59,130,246,0.4);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .adm-sidebar__logo-text {
          display: flex;
          flex-direction: column;
        }

        .adm-sidebar__logo-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: #f1f5f9;
          line-height: 1.2;
        }

        .adm-sidebar__logo-sub {
          font-size: 10px;
          color: rgba(148,163,184,0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Nav */
        .adm-sidebar__nav {
          flex: 1;
          padding: var(--space-3) 0;
          overflow-y: auto;
        }

        .adm-sidebar__group {
          padding: var(--space-2) var(--space-3);
        }

        .adm-sidebar__group-label {
          display: block;
          font-size: 10px;
          font-weight: var(--font-weight-bold);
          color: rgba(148,163,184,0.5);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: var(--space-2) var(--space-3);
          margin-top: var(--space-1);
        }

        .adm-sidebar__group-items {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .adm-sidebar__item {
          margin: 1px 0;
        }

        .adm-sidebar__link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          color: #94a3b8;
          text-decoration: none;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-fast);
          border-left: 2px solid transparent;
          width: 100%;
          cursor: pointer;
          background: none;
          border-right: none;
          border-top: none;
          border-bottom: none;
          font-family: inherit;
          text-align: left;
        }

        .adm-sidebar__link:hover:not(.adm-sidebar__item--active .adm-sidebar__link) {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
        }

        .adm-sidebar__item--active .adm-sidebar__link {
          background: rgba(59,130,246,0.15);
          color: #60a5fa;
          border-left-color: #3b82f6;
        }

        .adm-sidebar__item--active .adm-sidebar__link-icon {
          color: #60a5fa;
        }

        .adm-sidebar__link-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          flex-shrink: 0;
          color: #64748b;
          transition: color var(--transition-fast);
        }

        .adm-sidebar__link:hover .adm-sidebar__link-icon {
          color: #94a3b8;
        }

        .adm-sidebar__item--active .adm-sidebar__link:hover .adm-sidebar__link-icon {
          color: #60a5fa;
        }

        .adm-sidebar__link-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .adm-sidebar__link--signout {
          color: rgba(252,129,129,0.7);
        }

        .adm-sidebar__link--signout:hover {
          background: rgba(239,68,68,0.1);
          color: #fca5a5;
        }

        .adm-sidebar__link--signout .adm-sidebar__link-icon {
          color: rgba(252,129,129,0.5);
        }

        /* Collapsed state */
        .adm-sidebar--collapsed .adm-sidebar__logo {
          gap: 0;
        }

        .adm-sidebar--collapsed .adm-sidebar__group {
          padding: var(--space-2) var(--space-2);
        }

        .adm-sidebar--collapsed .adm-sidebar__link {
          padding: var(--space-2);
          justify-content: center;
        }

        /* Footer */
        .adm-sidebar__footer {
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .adm-sidebar__footer-brand {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .adm-sidebar__footer-version {
          font-size: 11px;
          font-weight: var(--font-weight-semibold);
          color: #475569;
        }

        .adm-sidebar__footer-env {
          font-size: 10px;
          color: #334155;
        }

        .adm-sidebar__footer-icon {
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .adm-sidebar {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
