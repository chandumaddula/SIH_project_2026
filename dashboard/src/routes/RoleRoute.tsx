import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/user';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate default dashboard if unauthorized for this route
    if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user?.role === 'officer') return <Navigate to="/dashboard/officer" replace />;
    if (user?.role === 'organisation') return <Navigate to="/dashboard/organisation" replace />;
    return <Navigate to="/dashboard/citizen" replace />;
  }

  return <Outlet />;
};
