export const APP_NAME = 'Metrology';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DASHBOARD_HOME: '/dashboard/home',
  DASHBOARD_SCAN: '/dashboard/scan',
  DASHBOARD_MAP: '/dashboard/map',
  DASHBOARD_COMPLIANCE: '/dashboard/compliance',
  DASHBOARD_INSPECTION: '/dashboard/inspection',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_ABOUT: '/dashboard/about',
  DASHBOARD_SETTINGS: '/dashboard/settings',
} as const;

export const INSPECTION_STATUS_LABELS = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  flagged: 'Flagged',
} as const;

export const COMPLIANCE_STATUS_LABELS = {
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant',
  pending: 'Pending',
} as const;

export const COMPLAINT_STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  resolved: 'Resolved',
} as const;

export const LOCATION_TYPES = {
  retail: 'Retail Shop',
  supermarket: 'Supermarket',
  market: 'Market',
  other: 'Other',
} as const;