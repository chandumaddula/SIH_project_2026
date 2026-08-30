import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      <Sidebar onToggle={toggleSidebar} />
      <Header />
      <main className="dashboard__content" onClick={closeSidebar}>
        <Outlet />
      </main>
      {sidebarOpen && (
        <div className="dashboard__overlay" onClick={closeSidebar} />
      )}
      <style>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
        }

        .dashboard__content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding-top: var(--header-height);
          min-height: 100vh;
          background-color: var(--color-white);
          transition: margin-left 0.3s ease;
        }

        .dashboard__overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: calc(var(--z-sticky) - 1);
        }

        @media (max-width: 768px) {
          .dashboard__content {
            margin-left: 0;
            padding-top: var(--header-height-mobile);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;