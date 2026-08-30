import React from 'react';
import { Button } from '../../components/Button';
import { useUserStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../../types/user';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useUserStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/dashboard/home');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayId = user.role === 'employee' ? (user as Employee).employeeId :
                    user.role === 'admin' ? (user as any).adminId :
                    user.email;

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-toggle"
          onClick={handleBackToHome}
          aria-label="Back to Home"
        >
          <span className="header__menu-icon">🏠</span>
        </button>
        <h1 className="header__title">Metrology Dashboard</h1>
      </div>

      <div className="header__right">
        <div className="header__user">
          <span className="header__user-name">{user.name}</span>
          <span className="header__user-role">{displayId}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="header__signout"
        >
          🚪 Sign Out
        </Button>
      </div>
      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--header-height);
          background-color: var(--color-white);
          border-bottom: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
          z-index: var(--z-sticky);
        }

        .header__left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .header__menu-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: background-color var(--transition-fast);
        }

        .header__menu-toggle:hover {
          background-color: var(--color-gray-100);
        }

        .header__menu-icon {
          font-size: var(--font-size-xl);
        }

        .header__title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0;
        }

        .header__right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .header__user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .header__user-name {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }

        .header__user-role {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .header__signout {
          gap: var(--space-2);
        }

        @media (max-width: 768px) {
          .header {
            left: 0;
            height: var(--header-height-mobile);
            padding: 0 var(--space-4);
          }

          .header__title {
            font-size: var(--font-size-lg);
          }

          .header__user-role {
            display: none;
          }

          .header__signout span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;