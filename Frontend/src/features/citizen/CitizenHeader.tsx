import React, { useCallback, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { useUserStore } from '../../store';

const IconMenu = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const IconSignOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const CitizenHeader: React.FC<{
  onHamburgerClick?: () => void;
  onSignOutClick?: () => void;
}> = ({ onHamburgerClick, onSignOutClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUserStore();

  const toggleSidebar = useCallback(() => {
    if (onHamburgerClick) {
      onHamburgerClick();
    } else {
      setSidebarOpen(prev => !prev);
    }
  }, [onHamburgerClick]);
  const openSignOutModal = useCallback(() => {
    if (onSignOutClick) {
      onSignOutClick();
    } else {
      setSignOutModalOpen(true);
    }
  }, [onSignOutClick]);
  const closeSignOutModal = useCallback(() => setSignOutModalOpen(false), []);

  const handleConfirmSignOut = useCallback(() => {
    setSignOutModalOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Helper to detect if a route is active (including subroutes)
  const isActiveRoute = (path: string) => {
    if (path === '/citizen/home' && location.pathname === '/citizen/home') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="cit-header">
      <div className="cit-header__inner">
        {/* Logo / Home button */}
        <button
          className="cit-header__home-btn"
          onClick={() => navigate('/citizen/home')}
          aria-label="Go to Home"
        >
          <div
            className="cit-header__logo"
            style={{
              background: 'linear-gradient(135deg, var(--color-navy-500), var(--color-navy-700))',
              color: 'var(--color-white)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="sr-only">Legal Metrology</span>
          </div>
        </button>

        {/* Mobile hamburger */}
        {window.innerWidth < 768 && (
          <button
            className="cit-header__hamburger"
            onClick={toggleSidebar}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <IconMenu />
          </button>
        )}

        {/* Desktop nav (hidden on mobile, shown in sidebar) */}
        {window.innerWidth >= 768 && (
          <nav className="cit-header__nav">
            <ul className="cit-header__menu">
              <li>
                <NavLink
                  to="/citizen/home"
                  className={`cit-header__nav-link ${isActiveRoute('/citizen/home') ? 'cit-header__nav-link--active' : ''}`}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/citizen/scan"
                  className={`cit-header__nav-link ${isActiveRoute('/citizen/scan') ? 'cit-header__nav-link--active' : ''}`}
                >
                  Scan Product
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/citizen/scans"
                  className={`cit-header__nav-link ${isActiveRoute('/citizen/scans') ? 'cit-header__nav-link--active' : ''}`}
                >
                  My Scans
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/citizen/complaints"
                  className={`cit-header__nav-link ${isActiveRoute('/citizen/complaints') ? 'cit-header__nav-link--active' : ''}`}
                >
                  My Complaints
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* Right-aligned actions */}
        <div className="cit-header__actions">
          <button
            className="cit-header__profile-btn"
            onClick={() => navigate('/citizen/profile')}
            aria-label="Go to Profile"
          >
            Profile
          </button>

          <button
            className="cit-header__settings-btn"
            onClick={() => navigate('/citizen/settings')}
            aria-label="Go to Settings"
          >
            Settings
          </button>

          <button
            className="cit-header__signout-btn"
            onClick={openSignOutModal}
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Sign-out confirmation modal */}
      <Modal
        isOpen={signOutModalOpen}
        onClose={closeSignOutModal}
        title="Sign Out"
        size="sm"
      >
        <div className="cit-header__signout-modal">
          <IconSignOut />
          <h3 className="cit-header__signout-title">Are you sure you want to sign out?</h3>
          <p className="cit-header__signout-text">
            You will need to log in again to access the Legal Metrology Compliance System.
          </p>
          <div className="cit-header__signout-actions">
            <Button variant="ghost" onClick={closeSignOutModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default CitizenHeader;