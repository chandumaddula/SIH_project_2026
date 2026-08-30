import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '../../components/Badge';

interface SidebarProps {
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  const menuItems = [
    { path: '/dashboard/home', label: 'Home', icon: '🏠' },
    { path: '/dashboard/scan', label: 'Scan/Upload', icon: '📷' },
    { path: '/dashboard/map', label: 'Map', icon: '🗺️' },
    { path: '/dashboard/compliance', label: 'Compliance', icon: '✅' },
    { path: '/dashboard/inspection', label: 'Inspection', icon: '🔍' },
    { path: '/dashboard/history', label: 'History', icon: '📜' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { path: '/dashboard/about', label: 'About', icon: 'ℹ️' },
    { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`sidebar ${isMobile && !location.pathname.includes('dashboard') ? 'sidebar--mobile' : ''}`}
    >
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">⚖️</div>
          <div className="sidebar__logo-text">
            <h2>Metrology</h2>
            <p className="sidebar__logo-subtitle">Employee Dashboard</p>
          </div>
        </div>
        {onToggle && (
          <button
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label="Toggle navigation"
          >
            <span className="sidebar__toggle-icon">☰</span>
          </button>
        )}
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <li key={index} className={`sidebar__menu-item ${active ? 'sidebar__menu-item--active' : ''}`}>
              <NavLink
                to={item.path}
                className="sidebar__nav-link"
                end
                aria-current={active ? 'page' : undefined}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-text">{item.label}</span>
                {item.label === 'Compliance' && (
                  <span className="sidebar__nav-badge">
                    <Badge variant="success" size="sm">
                      3
                    </Badge>
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__signout"
          onClick={() => {
            // Sign out handled in Header component
          }}
        >
          <span className="sidebar__signout-icon">🚪</span>
          <span className="sidebar__signout-text">Sign Out</span>
        </button>
      </div>
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--sidebar-width);
          background-color: var(--color-white);
          border-right: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          z-index: var(--z-sticky);
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .sidebar--mobile {
          transform: translateX(-100%);
          z-index: var(--z-modal);
        }

        .sidebar__header {
          padding: var(--space-5) var(--space-4);
          border-bottom: 1px solid var(--color-gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sidebar__logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .sidebar__logo-icon {
          font-size: 1.75rem;
          background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-600));
          width: 36px;
          height: 36px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
        }

        .sidebar__logo-text h2 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
        }

        .sidebar__logo-subtitle {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .sidebar__toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar__toggle-icon {
          font-size: var(--font-size-lg);
          color: var(--color-navy-700);
        }

        .sidebar__nav {
          flex: 1;
        }

        .sidebar__menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar__menu-item {
          margin: 0;
        }

        .sidebar__menu-item--active {
          background-color: var(--color-navy-50);
          border-left: 3px solid var(--color-gold-600);
        }

        .sidebar__menu-item--active .sidebar__nav-link {
          color: var(--color-navy-900);
          font-weight: var(--font-weight-semibold);
        }

        .sidebar__nav-link {
          display: flex;
          align-items: center;
          padding: var(--space-3) var(--space-5);
          text-decoration: none;
          color: var(--color-gray-700);
          font-size: var(--font-size-base);
          gap: var(--space-3);
          transition: background-color var(--transition-fast), color var(--transition-fast);
          width: 100%;
        }

        .sidebar__nav-link:hover:not(.sidebar__menu-item--active) {
          background-color: var(--color-gray-100);
          color: var(--color-navy-900);
        }

        .sidebar__nav-icon {
          font-size: var(--font-size-lg);
          min-width: 24px;
          text-align: center;
        }

        .sidebar__nav-text {
          flex: 1;
        }

        .sidebar__nav-badge {
          margin-left: auto;
        }

        .sidebar__footer {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-gray-200);
        }

        .sidebar__signout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          background: transparent;
          border: none;
          color: var(--color-error-600);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          padding: var(--space-3);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: background-color var(--transition-fast);
        }

        .sidebar__signout:hover {
          background-color: var(--color-error-100);
        }

        .sidebar__signout-icon {
          font-size: var(--font-size-lg);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            transform: translateX(-100%);
            z-index: var(--z-modal);
          }

          .sidebar--mobile {
            transform: translateX(0);
          }

          .sidebar__header {
            padding: var(--space-4) var(--space-3);
          }

          .sidebar__toggle {
            display: flex;
          }

          .sidebar__footer {
            padding: var(--space-3) var(--space-4);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;