import React from 'react';
import { createHashRouter, Navigate, RouteObject } from 'react-router-dom';
import { useUserStore } from './store';

import { PersonSelector } from './features/auth/PersonSelector';
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { Dashboard } from './features/dashboard/Dashboard';
import { Home } from './features/home/Home';
import { ScanPage } from './features/scan/ScanPage';
import { MapPage } from './features/map/MapPage';
import { Compliance } from './features/compliance/Compliance';
import { InspectionPage } from './features/inspection/Inspection';
import { History } from './features/history/History';
import { Profile } from './features/profile/Profile';
import { About } from './features/about/About';
import { Settings } from './features/settings/Settings';

/* Employee imports */
import { EmployeeDashboard } from './features/employee/EmployeeDashboard';
import { RequireEmployeeAuth } from './features/employee/RequireEmployeeAuth';
import { EmployeeHome } from './features/employee/EmployeeHome';
import { StartNewInspection } from './features/employee/StartNewInspection';
import { InspectionAnalysis } from './features/employee/InspectionAnalysis';
import { ExtractedInformation } from './features/employee/ExtractedInformation';
import { ApplicableRequirements } from './features/employee/ApplicableRequirements';
import { ComplianceScreening } from './features/employee/ComplianceScreening';
import { ReadabilityAnalysis } from './features/employee/ReadabilityAnalysis';
import { EvidenceManagement } from './features/employee/EvidenceManagement';
import { OfficerVerification } from './features/employee/OfficerVerification';
import { FinalInspection } from './features/employee/FinalInspection';
import { InspectionsList } from './features/employee/InspectionsList';
import { InspectionDetails } from './features/employee/InspectionDetails';
import { InspectionMap } from './features/employee/InspectionMap';
import { InspectionHistoryView } from './features/employee/InspectionHistoryView';
import { Complaints } from './features/employee/Complaints';
import { ComplaintDetails } from './features/employee/ComplaintDetails';
import { Reports } from './features/employee/Reports';
import { ReportDetails } from './features/employee/ReportDetails';
import { Notifications } from './features/employee/Notifications';
import { Products } from './features/employee/Products';
import { ProductDetails } from './features/employee/ProductDetails';
import { EmployeeProfile } from './features/employee/EmployeeProfile';
import { EmployeeAbout } from './features/employee/EmployeeAbout';
import { EmployeeSettings } from './features/employee/EmployeeSettings';

/* Citizen imports */
import { CitizenDashboard } from './features/citizen/CitizenDashboard';
import { CitizenHome } from './features/citizen/CitizenHome';
import { CitizenScanPage } from './features/citizen/CitizenScanPage';
import { CitizenScansList } from './features/citizen/CitizenScansList';
import { CitizenScanDetails } from './features/citizen/CitizenScanDetails';
import { CitizenComplaintsList } from './features/citizen/CitizenComplaintsList';
import { CitizenNewComplaint } from './features/citizen/CitizenNewComplaint';
import { CitizenComplaintDetails } from './features/citizen/CitizenComplaintDetails';
import { CitizenNotifications } from './features/citizen/CitizenNotifications';
import { CitizenLearn } from './features/citizen/CitizenLearn';
import { CitizenHelp } from './features/citizen/CitizenHelp';
import { CitizenProfile } from './features/citizen/CitizenProfile';
import { CitizenAbout } from './features/citizen/CitizenAbout';
import { CitizenSettings } from './features/citizen/CitizenSettings';

/* Admin imports */
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminOverview } from './features/admin/AdminOverview';
import { AdminAnalytics } from './features/admin/AdminAnalytics';
import { AdminGeography } from './features/admin/AdminGeography';
import { AdminPlaceholder } from './features/admin/AdminPlaceholder';

/* ==========================================================================
   Auth Guard Component
   Wraps protected routes. Redirects to '/' if not authenticated.
   ========================================================================== */
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/* ==========================================================================
   Citizen Guard Component
   Wraps citizen routes. Redirects citizens away from non-citizen pages.
   ========================================================================== */
const RequireCitizenAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

/* ==========================================================================
   Admin Guard Component
   Wraps admin routes. Only admins can access /admin/*.
   ========================================================================== */
const RequireAdminAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, personType } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (personType !== 'admin') {
    // If authenticated as citizen or employee, send to the shared dashboard
    return <Navigate to="/dashboard/home" replace />;
  }

  return <>{children}</>;
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <PersonSelector />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'scan',
        element: <ScanPage />,
      },
      {
        path: 'map',
        element: <MapPage />,
      },
      {
        path: 'compliance',
        element: <Compliance />,
      },
      {
        path: 'inspection',
        element: <InspectionPage />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/employee',
    element: (
      <RequireEmployeeAuth>
        <EmployeeDashboard />
      </RequireEmployeeAuth>
    ),
    children: [
      { path: '', element: <Navigate to="home" replace /> },
      { path: 'home', element: <EmployeeHome /> },
      { path: 'scan', element: <ScanPage /> },
      { path: 'inspection/new', element: <StartNewInspection /> },
      { path: 'inspection/analysis', element: <InspectionAnalysis /> },
      { path: 'inspection/extracted', element: <ExtractedInformation /> },
      { path: 'inspection/readability', element: <ReadabilityAnalysis /> },
      { path: 'inspection/requirements', element: <ApplicableRequirements /> },
      { path: 'inspection/compliance', element: <ComplianceScreening /> },
      { path: 'inspection/evidence', element: <EvidenceManagement /> },
      { path: 'inspection/verification', element: <OfficerVerification /> },
      { path: 'inspection/final', element: <FinalInspection /> },
      { path: 'inspections', element: <InspectionsList /> },
      { path: 'inspections/:inspectionId', element: <InspectionDetails /> },
      { path: 'map', element: <InspectionMap /> },
      { path: 'history', element: <InspectionHistoryView /> },
      { path: 'compliance', element: <Compliance /> },
      { path: 'complaints', element: <Complaints /> },
      { path: 'complaints/:complaintId', element: <ComplaintDetails /> },
      { path: 'inspection', element: <InspectionPage /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:productId', element: <ProductDetails /> },
      { path: 'reports', element: <Reports /> },
      { path: 'reports/:reportId', element: <ReportDetails /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <EmployeeProfile /> },
      { path: 'about', element: <EmployeeAbout /> },
      { path: 'settings', element: <EmployeeSettings /> },
    ],
  },
  {
    path: '/citizen',
    element: (
      <RequireCitizenAuth>
        <CitizenDashboard />
      </RequireCitizenAuth>
    ),
    children: [
      { path: '', element: <Navigate to="home" replace /> },
      { path: 'home', element: <CitizenHome /> },
      { path: 'scan', element: <CitizenScanPage /> },
      { path: 'scans', element: <CitizenScansList /> },
      { path: 'scans/:scanId', element: <CitizenScanDetails /> },
      { path: 'complaints', element: <CitizenComplaintsList /> },
      { path: 'complaints/new', element: <CitizenNewComplaint /> },
      { path: 'complaints/:complaintId', element: <CitizenComplaintDetails /> },
      { path: 'notifications', element: <CitizenNotifications /> },
      { path: 'learn', element: <CitizenLearn /> },
      { path: 'help', element: <CitizenHelp /> },
      { path: 'profile', element: <CitizenProfile /> },
      { path: 'about', element: <CitizenAbout /> },
      { path: 'settings', element: <CitizenSettings /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAdminAuth>
        <AdminDashboard />
      </RequireAdminAuth>
    ),
    children: [
      { path: '', element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <AdminOverview /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'geography', element: <AdminGeography /> },
      { path: 'employees', element: <AdminPlaceholder title="Employees" description="Manage officer accounts, role assignments, and access." icon="👥" /> },
      { path: 'citizens', element: <AdminPlaceholder title="Citizens" description="View and manage registered citizen accounts." icon="👤" /> },
      { path: 'inspections', element: <AdminPlaceholder title="Inspections" description="System-wide inspection oversight and filtering." icon="🔍" /> },
      { path: 'complaints', element: <AdminPlaceholder title="Complaints" description="Manage complaints across all officers and regions." icon="📋" /> },
      { path: 'products', element: <AdminPlaceholder title="Products" description="Product catalog and screening results." icon="📦" /> },
      { path: 'rules', element: <AdminPlaceholder title="Rule Management" description="Configure compliance rules and applicable requirements." icon="📜" /> },
      { path: 'roles', element: <AdminPlaceholder title="Roles & Permissions" description="Define roles, permissions, and access policies." icon="🔐" /> },
      { path: 'announcements', element: <AdminPlaceholder title="Announcements" description="Publish system announcements to citizens and employees." icon="📢" /> },
      { path: 'notifications', element: <AdminPlaceholder title="Notifications" description="System notifications and broadcast messages." icon="🔔" /> },
      { path: 'reports', element: <AdminPlaceholder title="Reports" description="Generate, view, and export system reports." icon="📄" /> },
      { path: 'audit', element: <AdminPlaceholder title="Audit Logs" description="System audit trail of admin and user actions." icon="📚" /> },
      { path: 'settings', element: <AdminPlaceholder title="System Settings" description="Platform configuration and integrations." icon="⚙️" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

export const router = createHashRouter(routes);