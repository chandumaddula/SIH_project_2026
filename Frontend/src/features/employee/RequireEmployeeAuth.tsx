import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store';

/**
 * Route guard for employee-only pages.
 * Requires the user to be authenticated AND have personType === 'employee'.
 * Redirects to '/' if not authenticated, or to '/dashboard/home' if
 * authenticated but not an employee.
 */
export const RequireEmployeeAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, personType } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (personType !== 'employee') {
    // If authenticated as citizen or admin, send to the shared dashboard
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

export default RequireEmployeeAuth;
