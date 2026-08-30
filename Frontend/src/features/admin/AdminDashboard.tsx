import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { useUserStore } from '../../store';

const IconSignOut = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-error-600)' }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const { logout } = useUserStore();
  const navigate = useNavigate();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const openSignOutModal = useCallback(() => {
    setSignOutModalOpen(true);
    setSidebarOpen(false);
  }, []);

  const closeSignOutModal = useCallback(() => setSignOutModalOpen(false), []);

  const handleConfirmSignOut = useCallback(() => {
    setSignOutModalOpen(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="adm-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onSignOutClick={openSignOutModal}
      />

      <AdminHeader onHamburgerClick={openSidebar} onSignOutClick={openSignOutModal} />

      <main className="adm-dashboard__content">
        <Outlet />
      </main>

      {sidebarOpen && (
        <div
          className="adm-dashboard__overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Modal
        isOpen={signOutModalOpen}
        onClose={closeSignOutModal}
        title="Sign Out"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeSignOutModal}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSignOut}>Sign Out</Button>
          </>
        }
      >
        <div className="adm-dashboard__signout-modal">
          <IconSignOut />
          <h3 className="adm-dashboard__signout-title">Are you sure you want to sign out?</h3>
          <p className="adm-dashboard__signout-text">
            You will need to log in again to access the Legal Metrology Admin Portal.
          </p>
        </div>
      </Modal>

      <style>{`
        .adm-dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f1f5f9;
        }

        .adm-dashboard__content {
          flex: 1;
          margin-left: var(--admin-sidebar-width, 260px);
          padding-top: var(--admin-header-height, 64px);
          min-height: 100vh;
          background-color: #f1f5f9;
          transition: margin-left 0.3s ease;
        }

        .adm-dashboard__overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: calc(var(--z-sticky) - 1);
          animation: admFadeIn 0.2s ease;
        }

        .adm-dashboard__signout-modal {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-3);
          padding: var(--space-3) 0;
        }

        .adm-dashboard__signout-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0;
        }

        .adm-dashboard__signout-text {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0;
        }

        @media (max-width: 1023px) {
          .adm-dashboard__content {
            margin-left: var(--admin-sidebar-collapsed, 68px);
          }
        }

        @media (max-width: 768px) {
          .adm-dashboard__content {
            margin-left: 0;
            padding-top: var(--admin-header-height-mobile, 56px);
          }
        }

        @keyframes admFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
