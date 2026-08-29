import React from 'react';
import { EmployeeDashboard } from '../pages/EmployeeDashboard';
import { UserDashboard } from '../pages/UserDashboard';
import { OrganisationDashboard } from '../pages/OrganisationDashboard';

interface AppRoutesProps {
  role: 'employee' | 'user' | 'organisation';
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ role }) => {
  switch (role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'user':
      return <UserDashboard />;
    case 'organisation':
      return <OrganisationDashboard />;
    default:
      return null;
  }
};
