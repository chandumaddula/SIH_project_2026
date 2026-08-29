import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ScanProduct } from '../pages/citizen/ScanProduct';
import { ScanHistory } from '../pages/citizen/ScanHistory';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { OrganisationDashboard } from '../pages/organisation/OrganisationDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuthStore } from '../store/authStore';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user?.role === 'officer') return <Navigate to="/dashboard/officer" replace />;
    if (user?.role === 'organisation') return <Navigate to="/dashboard/organisation" replace />;
    return <Navigate to="/dashboard/citizen" replace />;
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getDefaultRedirect()} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Citizen Routes */}
        <Route element={<RoleRoute allowedRoles={['citizen', 'admin', 'officer', 'organisation']} />}>
          <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          <Route path="/dashboard/citizen/verify" element={<ScanProduct />} />
          <Route path="/dashboard/citizen/history" element={<ScanHistory />} />
        </Route>

        {/* Officer Routes */}
        <Route element={<RoleRoute allowedRoles={['officer', 'admin']} />}>
          <Route path="/dashboard/officer" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/*" element={<OfficerDashboard />} />
        </Route>

        {/* Organisation Routes */}
        <Route element={<RoleRoute allowedRoles={['organisation', 'admin']} />}>
          <Route path="/dashboard/organisation" element={<OrganisationDashboard />} />
          <Route path="/dashboard/organisation/*" element={<OrganisationDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* Settings fallback route */}
        <Route path="/dashboard/settings" element={getDefaultRedirect()} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={getDefaultRedirect()} />
    </Routes>
  );
};
