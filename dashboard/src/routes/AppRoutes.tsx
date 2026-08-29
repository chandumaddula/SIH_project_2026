import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ScanProduct } from '../pages/citizen/ScanProduct';
import { ScanHistory } from '../pages/citizen/ScanHistory';
import { ProductInformation } from '../pages/citizen/ProductInformation';
import { Complaint } from '../pages/citizen/Complaint';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { NewInspection } from '../pages/employee/NewInspection';
import { OCRResults } from '../pages/employee/OCRResults';
import { VerifyProduct } from '../pages/employee/VerifyProduct';
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
        {/* Citizen Workflow Routes */}
        <Route element={<RoleRoute allowedRoles={['citizen', 'admin', 'officer', 'organisation']} />}>
          <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          <Route path="/dashboard/citizen/verify" element={<ScanProduct />} />
          <Route path="/dashboard/citizen/product-info" element={<ProductInformation />} />
          <Route path="/dashboard/citizen/ingredients" element={<ProductInformation />} />
          <Route path="/dashboard/citizen/complaints" element={<Complaint />} />
          <Route path="/dashboard/citizen/complaint" element={<Complaint />} />
          <Route path="/dashboard/citizen/history" element={<ScanHistory />} />
          <Route path="/dashboard/citizen/profile" element={<CitizenDashboard />} />
        </Route>

        {/* Officer / Employee Workflow Routes */}
        <Route element={<RoleRoute allowedRoles={['officer', 'admin']} />}>
          <Route path="/dashboard/officer" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/scan" element={<NewInspection />} />
          <Route path="/dashboard/officer/new-inspection" element={<NewInspection />} />
          <Route path="/dashboard/officer/ocr-results" element={<OCRResults />} />
          <Route path="/dashboard/officer/verify-product" element={<VerifyProduct />} />
          <Route path="/dashboard/officer/product-records" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/violations" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/complaints" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/history" element={<ScanHistory />} />
          <Route path="/dashboard/officer/reports" element={<OfficerDashboard />} />
          <Route path="/dashboard/officer/profile" element={<OfficerDashboard />} />
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
