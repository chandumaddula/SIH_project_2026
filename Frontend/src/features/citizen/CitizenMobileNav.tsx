import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ==========================================================================
   SVG Icons for mobile navigation
   ========================================================================== */

const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconScan = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconComplaints = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconNotifications = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconProfile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const CITIZEN_MOBILE_NAV_ITEMS: NavItem[] = [
  { to: '/citizen/home', label: 'Home', icon: <IconHome /> },
  { to: '/citizen/scan', label: 'Scan', icon: <IconScan /> },
  { to: '/citizen/scans', label: 'Scans', icon: <IconScan /> }, /* Reuse scan icon for scans */
  { to: '/citizen/complaints', label: 'Complaints', icon: <IconComplaints /> },
  { to: '/citizen/notifications', label: 'Notify', icon: <IconNotifications /> },
  { to: '/citizen/profile', label: 'Profile', icon: <IconProfile /> },
];

/* ==========================================================================
   Citizen Mobile Navigation (Bottom Nav)
   ========================================================================== */

export const CitizenMobileNav: React.FC = () => {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === '/') return false;
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="cit-mobile-nav">
      <ul className="cit-mobile-nav__list">
        {CITIZEN_MOBILE_NAV_ITEMS.map((item, index) => {
          const active = isActive(item.to);

          return (
            <li key={index} className={`cit-mobile-nav__item ${active ? 'cit-mobile-nav__item--active' : ''}`}>
              <NavLink
                to={item.to}
                className="cit-mobile-nav__link"
                end={item.to === '/citizen/home'}
                aria-current={active ? 'page' : undefined}
              >
                <span className="cit-mobile-nav__icon">{item.icon}</span>
                <span className="cit-mobile-nav__label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};