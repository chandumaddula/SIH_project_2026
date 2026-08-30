import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store';

/**
 * Route guard for citizen-only pages.
 * Requires the user to be authenticated AND have personType === 'citizen'.
 * Redirects to '/' if not authenticated, or to '/dashboard/home' if
 * authenticated but not a citizen.
 */
export const RequireCitizenAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, personType } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (personType !== 'citizen') {
    // If authenticated as employee or admin, send to the shared dashboard
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

export default RequireCitizenAuth;