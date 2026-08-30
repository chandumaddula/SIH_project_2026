/* ==========================================================================
   Admin Types - System-wide monitoring, analytics, geography
   ========================================================================== */

export type AdminLocationLevel = 'country' | 'state' | 'district' | 'market' | 'retail';

export interface AdminLocation {
  id: string;
  name: string;
  level: AdminLocationLevel;
  parentId?: string;
  /** Approximate lat/lng for map display. */
  lat?: number;
  lng?: number;
  children?: AdminLocation[];
  /** Aggregated metrics. */
  metrics?: {
    inspectionCount: number;
    complaintCount: number;
    potentialIssues: number;
    repeatLocations: number;
    pendingInspections: number;
  };
  lastInspection?: string;
}

export interface AdminKpis {
  totalInspections: number;
  productsScanned: number;
  openComplaints: number;
  potentialIssues: number;
  employees: number;
  reportsGenerated: number;
  pendingVerification: number;
}

export interface AdminTrendPoint {
  label: string;
  value: number;
}

export interface AdminCategoryPoint {
  category: string;
  count: number;
  potentialIssues: number;
}

export interface AdminActivityPoint {
  date: string;
  inspections: number;
  complaints: number;
  scans: number;
}

export type DateRangePreset = 'today' | '7days' | '30days' | 'custom';

export interface AdminDateRange {
  preset: DateRangePreset;
  from?: string;
  to?: string;
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'auth' | 'data' | 'config' | 'access';
  ip: string;
}
